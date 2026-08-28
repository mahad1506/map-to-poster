# Map module notes (`src/map`)

`map-init.js`
- Initializes Leaflet map and a secondary MapLibre GL "artistic" map.
- Synchronizes center/zoom between maps and exposes helpers to update style, position, and wait for tiles.
- Handles interactive route-editing on the artistic map.

`marker-manager.js`
- Manages marker creation, dragging, deletion on both Leaflet and MapLibre maps.
- Renders markers using `marker-icons` and keeps state in sync via `updateState`.

`route-manager.js` and `geocoder.js`
- `route-manager.js` updates route geometry and styles.
- `geocoder.js` provides `searchLocation` and coordinate formatting.

Useful links
- [src/map/map-init.js](src/map/map-init.js)
- [src/map/marker-manager.js](src/map/marker-manager.js)
- [src/map/route-manager.js](src/map/route-manager.js)
- [src/map/geocoder.js](src/map/geocoder.js)
