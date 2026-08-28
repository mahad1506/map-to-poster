# `src/map/marker-manager.js`

Summary
- Manages DOM and MapLibre markers for `state.markers`.
- Renders markers as HTML/SVG via `marker-icons.js` and keeps draggable behavior in sync.

Important behavior
- Creates both Leaflet and MapLibre markers when available.
- Uses `updateState()` on dragend to persist changes.

Edge cases
- Deleting markers removes both map implementations.
- Marker sizing scales via `markerSize` and base size constant.

Source: ../src/map/marker-manager.js
