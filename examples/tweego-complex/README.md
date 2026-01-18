# Tweego Complex Example: The Alchemist's Apprentice

A robust example demonstrating advanced i18n features in a game-like scenario.

## Features Shown
- **Pluralization**: Handles singular/plural forms for items (1 pill vs 5 pills).
- **Complex Interpolation**: Dynamic variables in sentences.
- **Data Passages**: 100% offline translations using separate `.twee` files per language.
- **Auto-Settings**: Uses the plugin's automatic integration with SugarCube's Settings API.

## How to Build

```bash
tweego -o build/index.html src/ ../../dist/sugarcube-i18n.js
```

Then open `build/index.html` in your browser.
