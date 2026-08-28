# `src/core/state.js`

Summary
- Central application state and persistence layer.
- Exports `state`, `defaultState`, `updateState()`, `subscribe()`, and helpers `getSelectedTheme()` / `getSelectedArtisticTheme()`.

Key behavior
- Loads/saves curated keys to `localStorage` under `map-to-poster:settings`.
- Notifies subscribers on state changes.
- Supports custom artistic themes via `loadCustomThemes()` fallback.

Important constants
- `STORAGE_KEY` — localStorage key
- `SAVED_KEYS` — list of keys persisted

Quick snippets
- Update state:

```js
import { updateState } from '../core/state.js';
updateState({ lat: -6.2, lon: 106.8 });
```

TODO
- Note: consider schema migration strategy if SAVED_KEYS change.
- Add unit tests for load/save edge cases.

Source: ../src/core/state.js
