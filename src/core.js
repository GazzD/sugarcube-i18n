"use strict";

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


export function getAvailableLanguages() {
  const i18nTag = "i18n";
  const prefix = "i18n-";
  const passages = Story.filter(p => p.tags.includes(i18nTag));
  
  const languages = new Set();
  
  // Add default/fallback language
  languages.add("en"); 
  
  passages.forEach(p => {
    if (p.title.startsWith(prefix)) {
        languages.add(p.title.substring(prefix.length));
    }
  });

  return Array.from(languages);
}

function loadDataPassages() {
  // Find all passages with the tag 'i18n'
  const i18nTag = "i18n";
  const prefix = "i18n-";
  const passages = Story.filter(function(passage) { return passage.tags.includes(i18nTag); });
  
  passages.forEach(passage => {
    try {
      // Remove "i18n-" prefix if present
      let lang = "en"; // Default
      
      // Try to determine language from passage name (e.g., "i18n-en", "i18n-es")
      if (passage.title.startsWith(prefix)) {
          lang = passage.title.substring(prefix.length); // Remove "i18n-"
      } else {
          console.warn(`[i18n] Passage "${passage.title}" has tag '${i18nTag}' but name does not start with "${prefix}". Skipping.`);
          return;
      }
      
      const data = JSON.parse(passage.text);
      
      if (!i18nOptions.resources[lang]) {
        i18nOptions.resources[lang] = { translation: {} };
      }
      
      // Merge
      Object.assign(i18nOptions.resources[lang].translation, data);
      console.log(`[i18n] Loaded data passage: ${passage.title} (${lang})`);
      
    } catch (e) {
      console.error(`[i18n] Failed to parse JSON in passage "${passage.title}":`, e);
    }
  });
}



export async function initI18n() {
  await loadScript(I18NEXT_CDN);

  // Load translations from data passages
  loadDataPassages();

  let initialLang = "en";
  
  // Priority 1: Settings API (Global User Preference)
  if (settings.i18n_lang) {
      initialLang = settings.i18n_lang;
  } 
  // Priority 2: Browser Navigator
  else if (navigator.language) {
    initialLang = navigator.language.split("-")[0];
  }

  await i18next.init({
    ...i18nOptions,
    lng: initialLang,
    interpolation: { escapeValue: false }
  });

  console.log(`[i18n] Initialized (${i18next.language})`);
}

export function setLang(lang) {
  if (settings.i18n_lang !== lang) {
      settings.i18n_lang = lang;
      Setting.save(); // Ensure persistence
  }
  return i18next.changeLanguage(lang);
}


export function translate(key, options = {}) {
  return window.i18next ? i18next.t(key, options) : key;
}
