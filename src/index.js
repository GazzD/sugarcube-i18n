import { initI18n, getAvailableLanguages, setLang } from "./core.js";
import { registerMacros } from "./macros.js";

registerMacros();

(async function () {
  try {

    // Lock the loading screen.
    var lockId = LoadScreen.lock();

    // Initialize i18n plugin configuration
    await initI18n();
    
    // Release the loading screen.
    LoadScreen.unlock(lockId);
    
  } catch (err) {
    console.error("[i18n] Init failed", err);
  }
})();


// Automatic Settings Integration
function initSettings() {
    const langs = getAvailableLanguages();
    if (langs.length > 1) {
        Setting.addList("i18n_lang", {
            label: "Language",
            list: langs,
            default: settings.i18n_lang || langs[0],
            onInit: function () {},
            onChange: function () {
                const newLang = settings.i18n_lang;
                if (window.i18next && newLang) {
                    setLang(newLang).then(() => Engine.show());
                }
            }
        });
    }
}

initSettings();


$(document).on(":storyready", () => {
    // If we have a setting saved, ensure i18next respects it on story ready
    if (settings.i18n_lang && window.i18next) {
        if (i18next.language !== settings.i18n_lang) {
             setLang(settings.i18n_lang);
        }
    } 
});
