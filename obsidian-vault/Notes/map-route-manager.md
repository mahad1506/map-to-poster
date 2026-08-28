# `src/map/route-manager.js`

Summary
- Computes route geometry and handles route styling for both Leaflet and MapLibre maps.
- Exposes `updateRouteGeometry()`, `syncRouteMarkers()`, and `updateRouteStyles()`.

Integration
- Works with route via points stored in `state.routeViaPoints` and start/end coordinates.

TODO
- Add unit tests for geometry calculation and `findBestInsertIndex` interactions.

Source: ../src/map/route-manager.js
