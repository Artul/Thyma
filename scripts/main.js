import {InitSettings} from "./settings.js";
import {InitLanguages} from "./languages.js";
import {InitKeybinds} from "./keybinds.js";
import {InitSpectatorCamera} from "./spectatorCamera.js";
import {InitCurrencies} from "./currencies.js";

Hooks.once("init", function() {
    game.thyma = {};
    InitLanguages();
    InitKeybinds();
    InitCurrencies();
});
Hooks.once("ready", function() {
    InitSettings();
    InitSpectatorCamera();
    game.socket.on("module.thyma", (event) => {
        if (event === "toggle-combat-mode") {
            game.thyma.spectatorCamera?.ToggleCombatMode();
        }
    });
});
