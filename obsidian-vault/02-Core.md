# Core module notes (`src/core`)

`state.js`
- Manages application state and persistence (localStorage).
- Exports `state`, `updateState`, `subscribe`, and helpers to get themes.
- Saves a curated list of keys to `map-to-poster:settings` in localStorage.

`themes.js`
- Defines a set of built-in theme objects (standard, dark, minimal, voyager, satellite).
- Each theme contains tile URLs, colors, and description.

Other core files (see source for details)
- `artistic-themes.js` — artistic MapLibre theme definitions
- `custom-themes.js` — load/save custom artistic themes
- `utils.js` — helpers (hexToRgba, geometry helpers)
- `marker-icons.js` — SVG/icon templates for markers
- `output-presets.js` — export sizes and presets

Useful links
- [src/core/state.js](src/core/state.js)
- [src/core/themes.js](src/core/themes.js)
- [src/core/utils.js](src/core/utils.js)
