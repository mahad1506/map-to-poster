# `src/map/map-init.js`

Summary
- Boots a Leaflet map and a synchronized MapLibre GL "artistic" map.
- Exposes helpers to update position, theme, wait for tiles, and interact with route editing.

Key functions
- `initMap(containerId, initialCenter, initialZoom, initialTileUrl)`
- `initArtisticMap(containerId, center, zoom)` — internal MapLibre init
- `updateArtisticStyle(theme)`, `updateMapTheme(tileUrl)`, `updateMapPosition()`
- `waitForTilesLoad()` and `waitForArtisticIdle()` used during exports

Notes
- Synchronization takes care to avoid circular updates using `isSyncing` flag.
- Route editing on artistic map listens for `mousedown` on `route-line` and inserts via points.

Source: ../src/map/map-init.js
