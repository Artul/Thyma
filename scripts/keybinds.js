
export const InitKeybinds = () => {
    game.keybindings.register("thyma", "toggle-ui", {
        name: game.i18n.localize("THYMA.keybindings.toggle-ui.name"),
        hint: game.i18n.localize("THYMA.keybindings.toggle-ui.hint"),
        editable: [
            {
                key: "KeyH"
            }
        ],
        restricted: false,
        onDown: () => {
            ToggleUI();
            return true;
        }
    });
    game.keybindings.register("thyma", "toggle-spectator-combat-mode", {
        name: game.i18n.localize("THYMA.keybindings.toggle-spectator-combat-mode.name"),
        hint: game.i18n.localize("THYMA.keybindings.toggle-spectator-combat-mode.hint"),
        editable: [
            {
                key: "KeyK"
            }
        ],
        restricted: false,
        onDown: () => {
            if (game.thyma.spectatorCamera == null && game.user.isGM) {
                game.socket.emit("module.thyma", "toggle-combat-mode");
            }
            game.thyma.spectatorCamera?.ToggleCombatMode();
            return true;
        }
    });
};

const ToggleUI = () => {
    document.body.classList.toggle("thyma-hide-ui");
};
