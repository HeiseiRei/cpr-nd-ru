const MODULE_ID = "cpr-ru";

function registerBabeleTranslations(babele) {
  if (typeof babele?.register !== "function") {
    console.error(`[${MODULE_ID}] Babele is active but its registration API is unavailable.`);
    return;
  }

  babele.register({
    module: MODULE_ID,
    dir: "babele/ru",
    lang: "ru",
  });
}

Hooks.once("init", () => {
  if (game.babele) {
    registerBabeleTranslations(game.babele);
    return;
  }

  Hooks.once("babele.init", registerBabeleTranslations);
});
