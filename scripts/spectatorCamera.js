import {GetMeasureTemplateCornerCoordinates} from "./utils.js";

export const InitSpectatorCamera = () => {
    if (game.user.id !== game.settings.get("thyma", "spectator-user") || !game.settings.get("thyma", "enable-spectator-camera")) {
        return;
    }
    game.thyma.spectatorCamera = new SpectatorCamera();
};
const minimumMoveDistance = 50;
const minimumScaleDifference = 0.05;
class SpectatorCamera {
    constructor() {
        this._hooks = []; // Store registered Hooks for later destruction
        this._isInCombat = false;
        this._currentCombatant = null; // { userId, tokenId, x, y }
        this._combatTargets = new Map(); // stores who is targeting which tokens { userId: { tokenId, x, y } }
        this._lastPlayerLocations = new Map(); // stores last known location for each player so we can update view in a way that keeps all player visible if one moves far away
        this._lastCameraLocation = null;
        this._lastCameraScale = null;
        this._activeImagePopout = null;
        this._activeImageTimeout = null;
        this.RegisterHooks();
        this.UpdatePlayerCharacters();
        canvas.dimensions.scale.min = 0;
    }
    Destroy() {
        for (const hookId of this._hooks) {
            Hooks.off(hookId);
        }
        this._hooks = [];
    }
    RegisterHooks() {
        this._hooks.push(
            Hooks.on("moveToken", this.OnMoveToken.bind(this)),
            Hooks.on("targetToken", this.OnTargetToken.bind(this)),
            Hooks.on("combatTurnChange", this.OnCombatTurnChange.bind(this)),
            Hooks.on("deleteCombat", this.OnDeleteCombat.bind(this)),
            Hooks.on("canvasReady", this.OnCanvasReady.bind(this)),
            Hooks.on("createMeasuredTemplate", this.OnCreateMeasureTemplate.bind(this)),
            Hooks.on("updateMeasuredTemplate", this.OnUpdateMeasureTemplate.bind(this)),
            Hooks.on("deleteMeasuredTemplate", this.OnDeleteMeasureTemplate.bind(this)),
            Hooks.on("userConnected", this.OnUserConnected.bind(this)),
            Hooks.on("renderImagePopout", this.OnRenderImagePopout.bind(this)),
        );
        game.socket.on("userActivity", (userId, data) => {
            if (data.ping != null && data.cursor != null) {
                this.PanToCoordinatesArray([...this._lastPlayerLocations.values(), data.cursor], true);
            }
        });
    }

    /**
     * A hook event that fires for every Token document that was moved after conclusion of an update workflow. This hook fires for all connected clients after the update has been processed.
     *
     * @param {TokenDocument} document The existing TokenDocument which was updated
     * @param {DeepReadonly<TokenMovementOperation>} movement The movement of the Token
     * @param {Partial<DatabaseUpdateOperation>} operation The update operation that contains the movement
     * @param {documents.User} user The User that requested the update operation
     * @returns {void}
     */
    OnMoveToken(document, movement, operation, user){
        const tokenWidth = document.width * game.canvas.grid.size;
        const tokenHeight = document.height * game.canvas.grid.size;

        const startCoordinates = {
            x: document.x + tokenWidth / 2,
            y: document.y + tokenHeight / 2,
        };
        const endCoordinates = {
            x: movement.destination.x + tokenWidth / 2,
            y: movement.destination.y + tokenHeight / 2,
        };

        const startVisible = game.canvas.visibility.testVisibility(startCoordinates);
        const endVisible = document._object.visible;

        const isPlayerToken = this._lastPlayerLocations.has(document.actorId);
        if (!this._isInCombat && !isPlayerToken) {
            return;
        }

        if (isPlayerToken) {
            this._lastPlayerLocations.set(document.actorId, endCoordinates);
        }

        /*const isTeleportMovement = operation.teleport; // operation.teleport => deprecation warning...
        if (isTeleportMovement) {
            if (!endVisible) {
                return;
            }
            this.PanToCoordinatesArray([endCoordinates]);
            return;
        }*/
        if (!startVisible && !endVisible) {
            return;
        }
        this.PanToCoordinatesArray([startCoordinates, endCoordinates]);
    }
    /**
     * A hook event that fires when a token is targeted or un-targeted.
     *
     * @param {documents.User} user The User doing the targeting
     * @param {canvas.placeables.Token} token The targeted Token
     * @param {boolean} targeted Whether the Token has been targeted or untargeted
     * @returns {void}
     */
    OnTargetToken(user, token, targeted){
        if (!this._combatTargets.has(user._id)) {
            this._combatTargets.set(user._id, []);
        }
        if (targeted) {
            const oldTargetList = this._combatTargets.get(user._id);
            this._combatTargets.set(user._id, [...oldTargetList, { tokenId: token._id, x: token.x, y: token.y }]);
        } else {
            const oldTargetList = this._combatTargets.get(user._id);
            this._combatTargets.set(user._id, oldTargetList.filter((entry) => entry.tokenId !== token._id));
        }
        if (!this._isInCombat || user._id != this._currentCombatant.userId) {
            return;
        }
        this.PanToCurrentCombatant();
    };

    /**
     * A hook event which fires when the turn order of a Combat encounter is progressed. This event fires on all clients after the database update has occurred for the Combat.
     *
     * @param {documents.Combat} combat The Combat encounter for which the turn order has changed
     * @param {CombatHistoryData} prior The prior turn state
     * @param {CombatHistoryData} current The new turn state
     * @returns {void}
     */
    OnCombatTurnChange(combat, prior, current){
        this._isInCombat = true;
        const token = game.canvas.scene.tokens.values().find((token) => token._id === current.tokenId);
        if (token == null || token._object.visible === false) {
            this._currentCombatant = null;
            return;
        }
        const user = game.users.values().find((user) => user.character?._id === token.actorId);
        const gmUser = game.users.values().find((user) => user.isGM);
        this._currentCombatant = { userId: user?._id ?? gmUser?._id, tokenId: token._id, x: token.x, y: token.y };
        this.PanToCurrentCombatant();
    };

    /**
     * A hook event that fires for every Document type after conclusion of an deletion workflow.
     *
     * @param {Document<object, DocumentConstructionContext>} document The new Document instance which was deleted
     * @param {Partial<DatabaseCreateOperation>} options Additional options which modified the deletion request
     * @param {String} userId The ID of the User who triggered the deletion workflow
     */
    OnDeleteCombat(document, options, userId){
        this._isInCombat = false;
        this.PanToCoordinatesArray(this._lastPlayerLocations.values());
    }
    /**
     * A hook event that fires when the Canvas is ready.
     * @param {canvas.Canvas} canvas The Canvas which is now ready for use
     * @returns {void}
     */
    OnCanvasReady(canvas){
        this.UpdatePlayerCharacters();
        this.PanToCoordinatesArray(this._lastPlayerLocations.values());
    }

    /**
     * A hook event that fires for every embedded Document type after conclusion of a creation workflow.
     *
     * @param {Document<object, DocumentConstructionContext>} document The new Document instance which has been created
     * @param {Partial<DatabaseCreateOperation>} options Additional options which modified the creation request
     * @param {String} userId The ID of the User who triggered the creation workflow
     */
    OnCreateMeasureTemplate(document, options, userId){
        const panCoordinatesArray = GetMeasureTemplateCornerCoordinates(document);
        if (this._isInCombat) {
            if (this._currentCombatant != null) {
                panCoordinatesArray.push(this._currentCombatant);
            }
        } else {
            panCoordinatesArray.push(...this._lastPlayerLocations.values());
        }
        this.PanToCoordinatesArray(panCoordinatesArray);
    };

    /**
     * A hook event that fires for every Document type after conclusion of an update workflow.
     *
     * @param {Document<object, DocumentConstructionContext>} document The existing Document which was updated
     * @param {object} changed Differential data that was used to update the document
     * @param {Partial<DatabaseCreateOperation>} options Additional options which modified the update request
     * @param {String} userId The ID of the User who triggered the update workflow
     */
    OnUpdateMeasureTemplate(document, changed, options, userId){
        const panCoordinatesArray = GetMeasureTemplateCornerCoordinates(document);
        if (this._isInCombat) {
            if (this._currentCombatant != null) {
                panCoordinatesArray.push(this._currentCombatant);
            }
        } else {
            panCoordinatesArray.push(...this._lastPlayerLocations.values());
        }
        this.PanToCoordinatesArray(panCoordinatesArray);
    };

    /**
     * A hook event that fires for every Document type after conclusion of an deletion workflow.
     *
     * @param {Document<object, DocumentConstructionContext>} document The Document instance of the measure template
     * @param {Partial<DatabaseCreateOperation>} options Additional options which modified the deletion request
     * @param {String} userId The ID of the User who triggered the deletion workflow
     */
    OnDeleteMeasureTemplate(document, options, userId){
        const panCoordinatesArray = [];
        if (this._isInCombat) {
            if (this._currentCombatant != null) {
                panCoordinatesArray.push(this._currentCombatant);
            }
        } else {
            panCoordinatesArray.push(...this._lastPlayerLocations.values());
        }
        this.PanToCoordinatesArray(panCoordinatesArray);
    };

    /**
     * A hook event that fires whenever some other User joins or leaves the game session.
     *
     * @param {documents.User} user The User who has connected or disconnected
     * @param {boolean} connected Is the user now connected (true) or disconnected (false)
     */
    OnUserConnected(user, connected) {
        if (connected) {
            this.UpdatePlayerCharacter(user);
            return;
        }
        this._lastPlayerLocations.delete(user.character?._id);
    }

    /**
     * A hook event that fires whenever an ApplicationV1 is rendered. Substitute the "ApplicationV1" in the hook event to target a specific ApplicationV1 type, for example "renderMyApplication". Each ApplicationV1 class in the inheritance chain will also fire this hook, i.e. "renderApplication" will also fire. The hook provides the pending application HTML which will be added to the DOM. Hooked functions may modify that HTML or attach interactive listeners to it.
     *
     * @param {Application} application The ApplicationV1 instance being rendered
     * @param {JQuery} html The inner jQuery of the document that will be displayed and may be modified
     * @param {object} data The object of data used when rendering the application
     */
    OnRenderImagePopout(application, html, data) {
        if (this._activeImagePopout && this._activeImagePopout !== application) {
            this._activeImagePopout.close();
        }
        if (this._activeImageTimeout) {
            clearTimeout(this._activeImageTimeout);
        }
        this._activeImagePopout = application;
        const timeoutSeconds = game.settings.get(
            "thyma",
            "image-popout-timeout"
        );
        this._activeImageTimeout = setTimeout(() => {
            if (this._activeImagePopout === application) {
                application.close();
                this._activeImagePopout = null;
                this._activeImageTimeout = null;
            }
        }, timeoutSeconds * 1000);
    }

    /**
     * A hook event that fires whenever combat changes
     */
    ToggleCombatMode() {
        this._isInCombat = !this._isInCombat;
        if (!this._isInCombat) {
            this.PanToCoordinatesArray(this._lastPlayerLocations.values());
            return;
        }
        const currentCombat = game.combats.values().find((combat) => combat.active);
        if (currentCombat == null) {
            return;
        }
        const token = game.canvas.scene.tokens.values().find((token) => token._id === currentCombat.current.tokenId);
        if (token == null || token._object.visible === false) {
            this._currentCombatant = null;
            return;
        }
        const user = game.users.values().find((user) => user.character?._id === token.actorId);
        const gmUser = game.users.values().find((user) => user.isGM);
        this._currentCombatant = { userId: user?._id ?? gmUser?._id, tokenId: token._id, x: token.x, y: token.y };
        this.PanToCurrentCombatant();
    }

    /*
    * Helper Funktions
    */

    UpdatePlayerCharacters() {
        this._lastPlayerLocations.clear();
        for (const user of game.users) {
            this.UpdatePlayerCharacter(user);
        }
    }
    UpdatePlayerCharacter(user) {
        if (user.character == null) {
            return;
        }
        const characterId = user.character._id;
        const token = game.canvas.scene.tokens.values().find((token) => token.actorId === characterId);
        if (token == null || token._object.visible === false) {
            return;
        }
        this._lastPlayerLocations.set(characterId, { x: token.x, y: token.y });
    }
    PanToCurrentCombatant() {
        const panCoordinatesArray = [this._currentCombatant];
        const userId = this._currentCombatant.userId ?? game.users.values().find((user) => user.isGM)?._id;
        if (userId != null && this._combatTargets.has(userId)) {
            const targets = this._combatTargets.get(userId);
            panCoordinatesArray.push(...targets);
        }
        this.PanToCoordinatesArray(panCoordinatesArray);
    }
    PanToCoordinatesArray(coordinates, quick = false) {
        if(!Array.isArray(coordinates)) {
            return;
        }
        const xCoordinates = coordinates.map((coordinate) => coordinate.x);
        const yCoordinates = coordinates.map((coordinate) => coordinate.y);
        const lowestX = Math.min(...xCoordinates);
        const lowestY = Math.min(...yCoordinates);
        const highestX = Math.max(...xCoordinates);
        const highestY = Math.max(...yCoordinates);
        const deltaX = highestX - lowestX;
        const deltaY = highestY - lowestY;
        const targetX = lowestX + deltaX / 2;
        const targetY = lowestY + deltaY / 2;

        const padding = 200;
        const requiredWidth = Math.max(deltaX + padding, 400);
        const requiredHeight = Math.max(deltaY + padding, 400);
        const scaleX = window.innerWidth / requiredWidth;
        const scaleY = window.innerHeight / requiredHeight;
        let targetScale = Math.min(scaleX, scaleY);
        targetScale = Math.max(game.canvas.dimensions.scale.min, targetScale);
        targetScale = Math.min(game.canvas.dimensions.scale.default, targetScale);

        // Prevent unnecessary panning
        if (this._lastCameraLocation !== null) {
            const deltaCameraX = targetX - this._lastCameraLocation.x;
            const deltaCameraY = targetY - this._lastCameraLocation.y;

            const distanceSquared = deltaCameraX * deltaCameraX + deltaCameraY * deltaCameraY;
            const scaleDifference = Math.abs(targetScale - this._lastCameraScale);

            const shouldMove = distanceSquared >= minimumMoveDistance * minimumMoveDistance;
            const shouldScale = scaleDifference >= minimumScaleDifference;

            if (!shouldMove && !shouldScale) {
                return;
            }
        }
        this._lastCameraLocation = { x: targetX, y: targetY };
        this._lastCameraScale = targetScale;
        game.canvas.animatePan({
            scale: targetScale,
            x: targetX,
            y: targetY,
            duration: quick ? 500 : 2500,
        });
    }
}
