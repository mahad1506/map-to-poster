# `src/core/utils.js`

Summary
- Utility helpers used across the app: color conversion, geometry helpers, search helpers.

Notable exports
- `hexToRgba(hex, alpha)` — converts hex color to rgba string.
- `findBestInsertIndex()` — used by route editing logic.

Review notes
- Keep utils small and well-tested; any heavy geometry code should be isolated for unit tests.

Source: ../src/core/utils.js
