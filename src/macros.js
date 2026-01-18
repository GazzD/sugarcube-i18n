import { translate, setLang } from "./core.js";

export function registerMacros() {

  /**
   * Macro: <<loadTranslations "path/to/file.json" [namespace]>>
   * [ADVANCED/LEGACY] Loads a JSON file via HTTP fetch.
   * WARNING: Requires a local HTTP server to work (won't work with file://).
   * Prefer using Data Passages (:: i18n-en [i18n]) for offline compatibility.
   *
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

          fetch(path)
              .then(response => {
                  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                  return response.json();
              })
              .then(data => {
                  if (window.i18next) {
                      i18next.addResourceBundle(lang, ns, data, true, true);
                      console.log(`[i18n] Loaded translations for ${lang} from ${path}`);
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
      handler() { 
      const lang = this.args[0]; 
      setLang(lang).then(() => Engine.show()); 
      } 
  });

  /**
   * Macro: <<t "key" [options]>>
   * Translates a key. Supports interpolation.
   * Options can be an object or key-value pairs.
   * Example:
   *  - No options:
   *    <<t "greeting">>
   *  - Object options:
   *    <<set $opts to { name: $name }>>
   *    <<t "greeting" $opts>>
   *  - Key-Value pairs options:
   *    <<t "greeting" "name" $name>>
   */
  Macro.add('t', {
      handler() {
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

          const text = translate(key, options);
          $(this.output).append($("<span>").html(text));
      }
  });

  /**
   * Macro: <<tlink "key" "passage" [options]>>
   * Translates a key and creates a link to a passage. Supports interpolation.
   * Options can be an object or key-value pairs.
   * Example:
   *  - No options:
   *    <<tlink "go-to-forest" "ForestPassage">>
   *  - Object options:
   *    <<set $opts to { name: $name }>>
   *    <<tlink "go-to-forest" "ForestPassage" $opts>>
   *  - Key-Value pairs options:
   *    <<tlink "go-to-forest" "ForestPassage" "name" $name>>
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
      const label = translate(key, options);
      new Wikifier(this.output, `<<link "${label}" "${passage}">><</link>>`);
    }
  });

  /**
   * Macro: <<tbutton "key" [options]>>
   * ...content...
   * <</tbutton>>
   * 
   * Creates a standard SugarCube <<button>> with a translated label.
   */
  Macro.add('tbutton', {
      tags: null, // Container macro
      handler() {
          if (this.args.length === 0) {
              return this.error("Usage: <<tbutton 'key' [options]>>");
          }

          const key = this.args[0];
          let options = {};
          
          // Argument parsing logic
          if (this.args.length > 1) {
              const second = this.args[1];
                if (second && typeof second === "object") {
                  options = second;
                } else {
                    for (let i = 1; i < this.args.length; i += 2) {
                      options[this.args[i]] = this.args[i + 1];
                    }
                }
          }

          const label = translate(key, options);
          
          // Escape double quotes in label to prevent breaking the generated macro syntax
          const safeLabel = label.replace(/"/g, '\\"');
          const content = this.payload[0].contents;

          // Generate and execute standard button macro with translated label
          new Wikifier(this.output, `<<button "${safeLabel}">>${content}<</button>>`);
      }
  });

}
