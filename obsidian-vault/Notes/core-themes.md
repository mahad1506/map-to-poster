# `src/core/themes.js`

Summary
- Built-in rendering themes (standard, dark, minimal, voyager, satellite).
- Each theme contains `name`, `tileUrl`, `tileUrlNoLabels`, `background`, `textColor`, `accent`, `overlayBg`, `route`, and `description`.

Usage
- Selected via `state.theme` and used by map rendering and overlay styling.

Notes
- Tile URLs rely on external tile providers; consider attribution and rate limits.
- `tileUrlNoLabels` used when `showLabels` is false.

Source: ../src/core/themes.js
