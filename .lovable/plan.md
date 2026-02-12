

## Fix: Define the Missing `--radius` CSS Variable

### Root Cause
The Tailwind config overrides the default `borderRadius` values to use a CSS variable:

```
borderRadius: {
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
}
```

But `--radius` is **never defined** in `src/index.css`. This means `rounded-lg`, `rounded-md`, and `rounded-sm` all resolve to empty/invalid values, producing no visible border radius on any element using these classes.

### Fix

**File: `src/index.css`** -- Add `--radius: 0.5rem;` (8px) to the `:root` block (around line 85, alongside the other CSS variables).

This single addition will:
- Make `rounded-lg` = 8px (the Helix spec value)
- Make `rounded-md` = 6px
- Make `rounded-sm` = 4px

All existing `rounded-lg` classes already applied to SelectTrigger, FilterBar buttons, and CombinedOptionalFilters will immediately take effect.

### No other changes needed
The previous edits to FilterBar.tsx, CombinedOptionalFilters.tsx, and select.tsx were correct -- they just had no visible effect because the variable was missing.

