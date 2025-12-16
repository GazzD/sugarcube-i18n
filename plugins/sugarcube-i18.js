/**
 * SugarCube i18next Plugin - MVP
 * 
 * A simple i18n plugin for SugarCube 2.x using i18next.
 * 
 * @license MIT
 * @version 1.0.0
 * 
 * Copyright (c) 2025 @GazzD
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
    "use strict";

    // --- Configuration ---
    const I18NEXT_CDN = "https://unpkg.com/i18next@latest/i18next.min.js";
    const STATE_VAR_NAME = "lang"; // The variable name in SugarCube State (e.g. $lang)

    // --- Constants ---
    // i18next options (can be extended later)
    const i18nOptions = {
        debug: true, // Enable debug logs
        fallbackLng: 'en',
        resources: {} // Will be populated via loadTranslations
    };

    /**
     * Loads the i18next library from CDN if not already present.
     * returns {Promise}
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (window.i18next) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Initializes the plugin.
     */
    async function initPlugin() {
        try {
            await loadScript(I18NEXT_CDN);
            console.log("[i18n] Library loaded.");

            // Initialize i18next
            // We check if a language was already saved in the state from a previous session
            // Note: During StoryInit, State.variables might not be fully populated from a save yet if relying on autoload,
            // but for a fresh start, we default to 'en'.
            // On a Load, the Save.onLoad handler will take care of switching.
            
            // Allow initial language detection or default
            let initialLang = "en"; 
            
            if (State.variables[STATE_VAR_NAME]) {
                 initialLang = State.variables[STATE_VAR_NAME];
            } else if (navigator.language) {
                // strict language match or just the first part 'en-US' -> 'en'
                // For MVP we just use the full string or fallback, user can refine mapping.
                 initialLang = navigator.language.split("-")[0];
            }

            await i18next.init({
                ...i18nOptions,
                lng: initialLang,
                interpolation: {
                    escapeValue: false // SugarCube handles escaping, and we want to allow HTML in translations if needed
                }
            });
            
            // Sync state variable if not set, OR sync lib to state if state is already set (Autoload race)
            if (!State.variables[STATE_VAR_NAME]) {
                State.variables[STATE_VAR_NAME] = i18next.language;
            } else if (State.variables[STATE_VAR_NAME] !== i18next.language) {
                // If State has a value (e.g. from Autoload) but we inited with default/browser, switch.
                 console.log(`[i18n] Late init sync: Switching to ${State.variables[STATE_VAR_NAME]}`);
                 await i18next.changeLanguage(State.variables[STATE_VAR_NAME]);
                 // Refresh if story is already visible
                 if (document.getElementById("passages")) {
                     Engine.show();
                 }
            }

            console.log(`[i18n] Initialized with language: ${i18next.language}`);

        } catch (err) {
            console.error("[i18n] Initialization failed:", err);
            // Functionality will handle missing 'i18next' gracefully or throw errors in macros
        }
    }

    // Run initialization
    initPlugin();


    // --- Macros ---

    /**
     * Macro: <<loadTranslations "path/to/file.json" [namespace]>>
     * Loads a JSON file and adds it to i18next resources.
     * MVP: Adds to generic 'translation' namespace or merges based on language code in filename or structure.
     * 
     * Convention for MVP:
     * The JSON file should be structured as:
     * {
     *   "key": "translation"
     * }
     * 
     * Wait, typically files are per language. 
     * Usage: <<loadTranslations "locales/en.json" "en">>
     */
    Macro.add('loadTranslations', {
        handler: function () {
            if (this.args.length < 2) {
                return this.error("Usage: <<loadTranslations 'path' 'langCode'>>");
            }

            const path = this.args[0];
            const lang = this.args[1];
            const ns = 'translation'; // default namespace

            // fetch is async, but macros in Init/StoryInit are synchronous. 
            // SugarCube doesn't pause for async macros in Init usually, but content won't render till ready if used in Passages.
            // For MVP, we assume this is called in StoryInit and might take a moment.
            
            fetch(path)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (window.i18next) {
                        i18next.addResourceBundle(lang, ns, data, true, true);
                        console.log(`[i18n] Loaded translations for ${lang} from ${path}`);
                        // If this is the current language, trigger a refresh might be needed if passage is already shown?
                        // Usually this is done in StoryInit so no passage is shown yet.
                        
                        // Force update engine if we are currently looking at this language
                        if (i18next.language === lang) {
                           Engine.show(); // Refreshes current passage if needed, though be careful in Init
                        }
                    }
                })
                .catch(err => {
                    console.error(`[i18n] Failed to load ${path}:`, err);
                    $(this.output).append(`<span class="error">i18n Error: Failed to load ${path}</span>`);
                });
        }
    });

    /**
     * Macro: <<setLang "code">>
     * Changes the current language and updates persistence.
     */
    Macro.add('setLang', {
        handler: function () {
            if (this.args.length === 0) {
                return this.error("Usage: <<setLang 'code'>>");
            }

            const lang = this.args[0];

            if (window.i18next) {
                i18next.changeLanguage(lang, (err, t) => {
                    if (err) return console.error('[i18n] Error changing language:', err);
                    
                    // Update State variable for persistence
                    State.variables[STATE_VAR_NAME] = lang;
                    console.log(`[i18n] Language set to ${lang}`);

                    // Refresh the current passage to reflect changes
                    Engine.show();
                });
            } else {
                this.error("i18next not initialized.");
            }
        }
    });

    /**
     * Macro: <<t "key" [options]>>
     * Translates a key. Supports interpolation.
     * Options can be an object or key-value pairs.
     * Example:
     *  - Object options: 
     *       <<set $opts to { name: $name }>>
     *       <<t "greeting" $opts>>
     *  - Key-Value pairs options:
     *       <<t "greeting" "name" $name>>
     */
    Macro.add('t', {
        handler: function () {
            if (this.args.length === 0) {
                return this.error("Usage: <<t 'key' [options]>>");
            }

            const key = this.args[0];
            let options = {};
            const second = this.args[1];
            if (this.args.length > 1 && typeof second === "object" && !Array.isArray(second)) {
				// Object form
				options = second;
			} else {
				// Key-value pairs form
				if ((this.args.length - 1) % 2 !== 0) {
					return this.error(
						"<<t>> expects key-value pairs or an options object"
					);
				}

				for (let i = 1; i < this.args.length; i += 2) {
					options[this.args[i]] = this.args[i + 1];
				}
			}

            if (window.i18next) {
                // Use i18next to translate
                const text = i18next.t(key, options);
                
                // Output parsed text wrapped in a span
                // We use .html() to allow HTML content in translations
                $(this.output).append($("<span>").html(text));
            } else {
                // Fallback if lib not ready
                $(this.output).append(key);
            }
        }
    });

    /**
     * Macro: <<tlink "key" "passage" [options]>>
     * Translates a key and creates a link to a passage. Supports interpolation.
     * Options can be an object or key-value pairs.
     * Example:
     * <<tlink "go-to-forest" "ForestPassage">>
     * <<tlink "go-to-forest" "ForestPassage" { name: $name }>>
     * <<tlink "go-to-forest" "ForestPassage" "name" $name>>
     */
    Macro.add("tlink", {
	handler() {
		const key = this.args[0];
		const passage = this.args[1];
		let options = {};

		if (this.args.length > 2) {
			const second = this.args[2];
			if (second && typeof second === "object") {
				options = second;
			} else {
				for (let i = 2; i < this.args.length; i += 2) {
					options[this.args[i]] = this.args[i + 1];
				}
			}
		}
        
        const label = window.i18next ? i18next.t(key, options) : key;

        new Wikifier(this.output, `<<link "${label}" "${passage}">><</link>>`);

	}
});

    
    // --- Persistence & Lifecycle Handlers ---

    // 1. Save Loading: Restore language from the save data
    Save.onLoad.add(function (save) {
        // SugarCube's Save.onLoad runs before the state is applied to the global State object.
        // We must inspect the save object directly to find the language variable.
        if (save && save.state && save.state.history && save.state.history.length > 0) {
             // Get the most recent moment from the history
             const index = save.state.index !== undefined ? save.state.index : save.state.history.length - 1;
             const moment = save.state.history[index];
             
             if (moment && moment.variables && moment.variables[STATE_VAR_NAME]) {
                 const savedLang = moment.variables[STATE_VAR_NAME];
                 if (window.i18next && savedLang) {
                     console.log(`[i18n] Restoring language from save: ${savedLang}`);
                     i18next.changeLanguage(savedLang);
                     // No need to call Engine.show() here, SugarCube will render the passage after load completes.
                 }
            }
        }
    });

    // 2. Session Autoload / Startup Sync
    // Ensure i18next matches the State variable if a session was restored (Autoload)
    $(document).on(':storyready', function () {
        // At this point, State.variables is fully restored/initialized.
        // If the plugin is already loaded, sync immediately.
        // If not, the initPlugin logic will handle the sync when it completes (via check).
        if (window.i18next && State.variables[STATE_VAR_NAME]) {
             if (i18next.language !== State.variables[STATE_VAR_NAME]) {
                 console.log(`[i18n] Syncing language from session: ${State.variables[STATE_VAR_NAME]}`);
                 i18next.changeLanguage(State.variables[STATE_VAR_NAME]);
                 Engine.show();
             }
        }
    });

})();
