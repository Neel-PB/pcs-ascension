

## Revert Primary Color to #1E69D2 Globally

### Problem
The `--primary` CSS variable was changed to `219 82% 33%` (#0F3C97 -- shade 700), but the correct brand color is **#1E69D2** (`211 75% 47%` -- shade 500). This is a single global fix in `src/index.css`.

### Changes (single file: `src/index.css`)

Revert all four variables back to `211 75% 47%`:
- `--primary`: `219 82% 33%` --> `211 75% 47%`
- `--ring`: `219 82% 33%` --> `211 75% 47%`
- `--sidebar-primary`: `219 82% 33%` --> `211 75% 47%`
- `--sidebar-ring`: `219 82% 33%` --> `211 75% 47%`

Revert gradient endpoints back to shade 600:
- `--gradient-primary`: endpoint from `hsl(222 91% 21%)` --> `hsl(216 80% 39%)`
- `--gradient-text`: same revert

### Why this works globally
Every component (buttons, tabs, sidebar, AI Hub, filters, icons, focus rings) already uses `bg-primary`, `text-primary`, or `border-primary`. Fixing the CSS variable once fixes everything -- no per-component changes needed.

### No other files touched
- Dark mode stays as-is (shade 200, already correct)
- `DynamicIconOnlySidebar.tsx` already uses `bg-primary` so it picks up the fix automatically
- All other components unchanged

