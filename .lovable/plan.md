

## Darken Active Sidebar Route Background

### Problem
The active route indicator in the sidebar uses `bg-primary` (#1E69D2 / shade 500), which appears too light as a solid background fill. A darker brand shade would look more intentional and provide better contrast with the white icon/text.

### Solution
Use the brand's 700 shade (#0F3C97) for the active sidebar indicator background instead of the 500 shade.

### Changes

**File: `src/components/layout/DynamicIconOnlySidebar.tsx`**
- Line 86: Change `className="absolute inset-0 rounded-xl bg-primary"` to use a custom darker blue via an inline style or a Tailwind arbitrary value: `bg-[#0F3C97]`

This targets only the sidebar active indicator -- buttons, tabs, badges, and all other `bg-primary` usages remain #1E69D2 (shade 500) as intended.

### Alternative
If you'd prefer shade 600 (#1551B4) instead of 700 (#0F3C97), just let me know. Shade 700 is deeper/richer, shade 600 is a middle ground.
