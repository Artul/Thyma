export const InitSettings = () => {
    const users = GetUsers();
    game.settings.register("thyma","enable-spectator-camera", {
        name: game.i18n.localize("THYMA.settings.enable-spectator-camera.name"),
        hint: game.i18n.localize("THYMA.settings.enable-spectator-camera.hint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
    });
    game.settings.register("thyma","spectator-user", {
        name: game.i18n.localize("THYMA.settings.spectator-user.name"),
        hint: game.i18n.localize("THYMA.settings.spectator-user.hint"),
        scope: "world",
        config: true,
        type: String,
        choices: {
            "": "",
            ...users,
        },
        default: "",
        requiresReload: true,
    });
    game.settings.register("thyma", "image-popout-timeout", {
        name: "THYMA.settings.image-popout-timeout.name",
        hint: "THYMA.settings.image-popout-timeout.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 15
    });
};

const GetUsers = () => {
    let users = {};
    game.users.forEach((user) => {
        users[user.id] = user.name;
    });
    return users;
};
