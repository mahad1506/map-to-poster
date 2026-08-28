# `src/ui/form.js`

Summary
- Binds DOM controls to application state and map functions.
- Handles UI flows: search, presets, theme selection, custom theme editor, marker and route toggles, export presets.

Interactive pieces
- Builds the artistic theme grid and modal, custom theme editor modal, and exports/imports for custom themes.
- Updates map via `updateArtisticStyle()` and `updateMarkerStyles()` when controls change.

TODO
- Consider splitting very large `setupControls()` into smaller functions for maintainability.
- Add unit/integration tests for modal flows.

Source: ../src/ui/form.js
