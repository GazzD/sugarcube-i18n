import { initI18n, STATE_VAR_NAME } from "./core.js";
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

// Save / Load hooks
Save.onLoad.add(save => {
  const moment = save?.state?.history?.[save.state.index];
  const lang = moment?.variables?.[STATE_VAR_NAME];
  if (lang && window.i18next) {
    i18next.changeLanguage(lang);
  }
});

$(document).on(":storyready", () => {
  if (window.i18next && State.variables[STATE_VAR_NAME]) {
    i18next.changeLanguage(State.variables[STATE_VAR_NAME]);
  }
});
