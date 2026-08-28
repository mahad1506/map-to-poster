# `src/core/custom-themes.js`

Summary
- Handles persist/load/export of user-created artistic themes.
- API surface includes: `loadCustomThemes`, `saveCustomTheme`, `deleteCustomTheme`, `newCustomThemeKey`, `exportCustomThemes`, `importCustomThemesFromJSON`, `clearCustomThemes`.

Security / UX notes
- Export/Import uses JSON; ensure UI warns about overwriting.
- Consider validating theme JSON schema on import.

Source: ../src/core/custom-themes.js
