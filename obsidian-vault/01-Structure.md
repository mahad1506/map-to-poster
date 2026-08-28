Project structure (top-level)

- index.html — UI shell
- main.js — app bootstrap
- src/
  - core/ — app core logic and themes
  - map/ — map-related code (Leaflet + MapLibre integrations)
  - ui/ — UI control bindings
- public/ — static assets
- docker/ — nginx config

Open files for details:
- [src/core/state.js](src/core/state.js)
- [src/core/themes.js](src/core/themes.js)
- [src/map/map-init.js](src/map/map-init.js)
- [src/map/marker-manager.js](src/map/marker-manager.js)
- [src/ui/form.js](src/ui/form.js)
