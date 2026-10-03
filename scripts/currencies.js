export const InitCurrencies = () => {
    console.log(CONFIG.DND5E.currencies);
    delete CONFIG.DND5E.currencies.ep;
    // Dark Blossoms
    CONFIG.DND5E.currencies.darkBright = {
        label: "Dark Bright Blossom",
        abbreviation: "dbb",
        conversion: 1,
        icon: "modules/thyma/icons/currency/DarkBrightBlossom.webp",
    };
    CONFIG.DND5E.currencies.darkShimmering = {
        label: "Dark Glimmer Blossom",
        abbreviation: "dgb",
        conversion: 0.5,
        icon: "modules/thyma/icons/currency/DarkGlimmerBlossom.webp",
    };
    CONFIG.DND5E.currencies.darkDull = {
        label: "Dark Dull Blossom",
        abbreviation: "ddb",
        conversion: 0.1,
        icon: "modules/thyma/icons/currency/DarkDullBlossom.webp",
    };

    // Sun Blossoms
    CONFIG.DND5E.currencies.sunBright = {
        label: "Sun Bright Blossom",
        abbreviation: "sbb",
        conversion: 0.1,
        icon: "modules/thyma/icons/currency/SunBrightBlossom.webp",
    };
    CONFIG.DND5E.currencies.sunShimmering = {
        label: "Sun Glimmer Blossom",
        abbreviation: "sgb",
        conversion: 0.05,
        icon: "modules/thyma/icons/currency/SunGlimmerBlossom.webp",
    };
    CONFIG.DND5E.currencies.sunDull = {
        label: "Sun Dull Blossom",
        abbreviation: "sdb",
        conversion: 0.01,
        icon: "modules/thyma/icons/currency/SunDullBlossom.webp",
    };

    // Moon Blossoms
    CONFIG.DND5E.currencies.moonBright = {
        label: "Moon Bright Blossom",
        abbreviation: "mbb",
        conversion: 0.01,
        icon: "modules/thyma/icons/currency/MoonBrightBlossom.webp",
    };
    CONFIG.DND5E.currencies.moonShimmering = {
        label: "Moon Glimmer Blossom",
        abbreviation: "mgb",
        conversion: 0.005,
        icon: "modules/thyma/icons/currency/MoonGlimmerBlossom.webp",
    };
    CONFIG.DND5E.currencies.moonDull = {
        label: "Moon Dull Blossom",
        abbreviation: "mdb",
        conversion: 0.001,
        icon: "modules/thyma/icons/currency/MoonDullBlossom.webp",
    };
}
