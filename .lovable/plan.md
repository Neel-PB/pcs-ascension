

## Force Light Theme Only -- Remove Theme Toggle

### Changes

**1. `src/App.tsx`** -- Force light theme
- Change `ThemeProvider` props from `defaultTheme="system" enableSystem` to `defaultTheme="light" forcedTheme="light"` and remove `enableSystem`
- This locks the entire app to light theme regardless of user/system preference

**2. `src/components/shell/AppHeader.tsx`** -- Remove theme toggle button
- Remove the theme toggle button (lines 156-160) from the header
- Remove unused imports: `Sun`, `Moon`, `Monitor` from icons, `useTheme` from next-themes
- Remove the `cycleTheme` and `getThemeIcon` functions
- Remove the `theme` and `setTheme` destructuring

### Result
- App is locked to light theme
- No theme toggle button visible to users
- Easy to re-enable later by reverting these two changes
