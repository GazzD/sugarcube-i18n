# SugarCube i18n Plugin

A lightweight, open-source plugin to add multilingual support to [SugarCube 2.x](http://www.motoslave.net/sugarcube/2/) stories using [i18next](https://www.i18next.com/).

## Features

- **Zero-Config Setup**: Automatically detects languages and adds a Settings menu.
- **Offline Ready**: Use **Data Passages** to store translations directly in your game file. No server required.
- **Easy Translation**: `<<t>>` macro for text, `<<tlink>>` for translated links.
- **Robust**: Supports pluralization, interpolation (`Hello, {{name}}!`), and HTML formatting.
- **Editor Friendly**: Includes configuration for `t3lt` VS Code extension.

## Installation

### Option A: NPM (Recommended for Tweego users)
If you manage your project dependencies with npm:

```bash
npm install sugarcube-i18n
```

Then, include the library in your build command. The file is located at `node_modules/sugarcube-i18n/dist/sugarcube-i18n.js`.

### Option B: Direct Download (For Twine App)
1.  Download `sugarcube-i18n.js` from the [releases page](https://github.com/GazzD/sugarcube-i18n/releases) (or the `dist/` folder).
2.  Open your story in Twine 2.
3.  Go to **Story Menu** -> **Edit Story JavaScript**.
4.  Paste the content of the file.

> **Note**: Requires an internet connection to load `i18next` from the CDN. For completely offline games, paste the code of `i18next.min.js` *before* this plugin code.

## Usage

### 1. Define Translations (Data Passages)
This is the modern, recommended way. It works 100% offline (file://) and inside Twine's "Play" mode.

1.  Create a new passage.
2.  Add the tag `i18n`.
3.  Name it `i18n-<code>` (e.g., `i18n-en`, `i18n-es`).
4.  Paste your JSON content.

**Passage: `i18n-en`** `[tag: i18n]`
```json
{
  "greeting": "Hello, {{name}}!",
  "apples_one": "You have one apple.",
  "apples_other": "You have {{count}} apples."
}
```

**Passage: `i18n-es`** `[tag: i18n]`
```json
{
  "greeting": "¡Hola, {{name}}!",
  "apples_one": "Tienes una manzana.",
  "apples_other": "Tienes {{count}} manzanas."
}
```

### 2. Macros

#### `<<t "key" [options]>>`
Use the `<<t>>` macro to translate text. You can pass interpolation options as an object or as key-value pairs.

```
/* Option 1: Key-Value pairs (Recommended for simple cases) */
<<t "greeting" "name" $name>>

/* Option 2: Using an object variable */
<<set $opts to {name: $name}>>
<<t "greeting" $opts>>

/* Option 3: Basic usage */
<<t "welcome">>

/* Plurals (automatically uses _one or _other based on count) */
<<t "apples" "count" $appleCount>>
```

#### `<<tlink "key" "passageName" [options]>>`
Creates a standard link with translated label.

```
<<tlink "back_button" "Hub">>
```

#### `<<tbutton "key" [options]>>`
Creates a standard button with translated label. Acts as a container macro.

```
<<tbutton "start_game">>
    <<run Engine.play("Hub")>>
<</tbutton>>
```


### 3. Language Switching
The plugin **automatically** adds a "Language" dropdown to the SugarCube **Settings** panel if it detects more than one language. The user's choice is saved automatically.

To force a language change manually:
```
<<setLang "es">>
```

## Legacy: HTTP Loading (Advanced)
If you prefer loading separate `.json` files via AJAX (requires a local HTTP server):

```
<<loadTranslations "locales/en.json" "en">>
```
*Warning*: This will fail strictly in offline/local file contexts due to CORS.

## Building with Tweego
Include the JS file in your compilation.

```bash
tweego -o index.html src/ node_modules/sugarcube-i18n/dist/sugarcube-i18n.js
```

## Editor Support (Optional)

To avoid macro warnings in editors like Tweego / t3lt, you can add a
`twee-config.yaml` file defining the custom macros.

An example is provided in the `editor/` folder.

## Examples
Check the `examples/` folder:
- **tweego-basic**: Minimal setup.
- **tweego-complex**: Inventory demo with styles and pluralization.

## License
MIT License. Free to use in commercial and non-commercial projects.

