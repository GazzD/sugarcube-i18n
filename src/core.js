"use strict";

export const STATE_VAR_NAME = "lang";
const I18NEXT_CDN = "https://unpkg.com/i18next@latest/i18next.min.js";

const i18nOptions = {
  debug: true,
  fallbackLng: "en",
  resources: {}
};

function loadScript(src) {
  // Load the script
  return new Promise((resolve, reject) => {
    // If i18next is already loaded, return it
    if (window.i18next) return resolve();  
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export async function initI18n() {
  await loadScript(I18NEXT_CDN);

  let initialLang = "en";
  if (State.variables[STATE_VAR_NAME]) {
    initialLang = State.variables[STATE_VAR_NAME];
  } else if (navigator.language) {
    initialLang = navigator.language.split("-")[0];
  }

  await i18next.init({
    ...i18nOptions,
    lng: initialLang,
    interpolation: { escapeValue: false }
  });

  if (!State.variables[STATE_VAR_NAME]) {
    State.variables[STATE_VAR_NAME] = i18next.language;
  }

  console.log(`[i18n] Initialized (${i18next.language})`);
}

export function setLang(lang) {
  return i18next.changeLanguage(lang).then(() => {
    State.variables[STATE_VAR_NAME] = lang;
  });
}

export function translate(key, options = {}) {
  return window.i18next ? i18next.t(key, options) : key;
}
