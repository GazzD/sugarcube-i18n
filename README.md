# SugarCube i18n Plugin

A lightweight, open-source plugin to add multilingual support to [SugarCube 2.x](http://www.motoslave.net/sugarcube/2/) stories using [i18next](https://www.i18next.com/).

## Features

- **Easy Translation**: Use the `<<t>>` macro to display text.
- **External Files**: Load translations from clean JSON files.
- **Persistence**: Automatically saves and restores the selected language on save/load.
- **Interpolation**: Support for variables inside translations (e.g., "Hello, {{player}}!").
- **Language Switching**: Hot-swap languages without reloading the page.


## CLI Build (Tweego)

If you are using `tweego` from the command line, you must include the JavaScript file in your build command so it is bundled directly.

```bash
tweego -o build/story.html story.twee sugarcube-i18next.js
```

## Installation


1. **Download the Script**: Get `sugarcube-i18next.js` from this repository.
2. **Add to Twine**:
   - Open your story in Twine 2.
   - Go to **Story Menu** -> **Edit Story JavaScript**.
   - Paste the entire content of `sugarcube-i18next.js`.
3. **External Library**: The script automatically loads `i18next` from a CDN (`unpkg.com`). 
   - *Note*: You need an internet connection for the CDN to work. For offline use, download `i18next.min.js` and add its content to your Story JavaScript *before* the plugin code.

## Usage

### 1. Create Translation Files
Create JSON files for each language (e.g., `en.json`, `es.json`) in a folder named `locales` relative to your HTML game file.

**locales/en.json**
```json
{
  "greeting": "Hello, {{name}}!",
  "start_btn": "Start Game"
}
```

**locales/es.json**
```json
{
  "greeting": "¡Hola, {{name}}!",
  "start_btn": "Comenzar Juego"
}
```

### 2. Initialize in StoryInit
Load your translation files in the `StoryInit` passage.

```
<<loadTranslations "locales/en.json" "en">>
<<loadTranslations "locales/es.json" "es">>
```

> **Important**: Loading local JSON files via `fetch` requires a local web server due to browser security policies (CORS). If you just open the HTML file directly from disk, it might fail. Use VS Code Live Server or `python -m http.server` to test.

### 3. Display Text
Use the `<<t>>` macro to translate text. You can pass interpolation options as an object or as key-value pairs.

```
/* Option 1: Key-Value pairs (Recommended for simple cases) */
<<t "greeting" "name" $name>>

/* Option 2: Using an object variable */
<<set $opts to {name: $name}>>
<<t "greeting" $opts>>

/* Option 3: Basic usage */
<<t "welcome">>
```

### 4. Translated Links
Use `<<tlink>>` to simplify creating links with translated text.

```
/* Basic Link */
<<tlink "start_btn" "NextPassage">>

/* Link with interpolation */
<<tlink "continue_btn" "Chapter1" "chapter" 1>>
```

### 5. Switch Language
Use macros or buttons to let the user change the language.

```
<<button "English">>
    <<setLang "en">>
<</button>>

<<button "Español">>
    <<setLang "es">>
<</button>>
```

## API Reference

### `<<loadTranslations "path" "langCode">>`
Loads a JSON file from the specified path and assigns it to the language code.
- **path**: Relative URL to the JSON file.
- **langCode**: The language code (e.g., 'en', 'es', 'fr').

### `<<setLang "langCode">>`
Switches the current language to `langCode`.
- Updates `$lang` variable.
- Refreshes the current passage to apply changes immediately.

### `<<t "key" [options]>>`
Returns the translation for the given key.
- **key**: The JSON key.
- **options**:
    - **Object**: A JavaScript object (e.g., `<<set $o to {n:1}>> <<t "k" $o>>`).
    - **Key-Value Pairs**: Alternating key and value arguments (e.g., `<<t "key" "param" $value>>`).

### `<<tlink "key" "passage" [options]>>`
Creates a standard SugarCube link `<<link>>` using the translated text as the label.
- **key**: The JSON key for the link text.
- **passage**: The destination passage name.
- **options**: Same interpolation options as `<<t>>`.

## Editor Support (Optional)

To avoid macro warnings in editors like Tweego / t3lt, you can add a
`twee-config.yaml` file defining the custom macros.

An example is provided in the `editor/` folder.


## Troubleshooting

- **"Failed to load locales/en.json"**: This is usually a CORS error. Ensure you are running the game via a local server (http://localhost...) and not file protocol (file://...).
- **"i18next is not defined"**: Check your internet connection (if using CDN) or ensure the library logic is correct.
- **Missing Keys**: Use `debug: true` in the internal `i18nOptions` inside the JS file to see warnings in the browser console.

## License
MIT License. Free to use in commercial and non-commercial projects.
