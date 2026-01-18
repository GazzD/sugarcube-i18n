# Tweego Basic Example

This example demonstrates how to use the **Data Passages** feature to create a 100% offline-compatible multilingual game.

## Structure
- `src/example.twee`: contains the story code.
- `src/locale.twee`: contains the translation data passages.
- `../../dist/sugarcube-i18n.js`: the built plugin.

## How to Build
Run the following command in this directory:

```bash
tweego -o build/index.html src/ ../../dist/sugarcube-i18n.js
```

This will generate `build/index.html`. You can open this file directly in your browser (`file://`), and translations will work immediately without any local server.
