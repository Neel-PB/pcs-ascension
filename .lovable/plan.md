

## Apply Brand 700 (#0F3C97) as the Primary Color Everywhere

### Overview
Instead of updating individual components, the most efficient approach is to change the `--primary` CSS variable itself from the 500 shade (#1E69D2) to the 700 shade (#0F3C97). This single change will automatically update every element that uses `bg-primary`, `text-primary`, `border-primary` -- including buttons, tabs, search icons, the AI Hub trigger, filter badges, and all other blue UI elements.

### Changes

**File: `src/index.css`** (single file)

**Light Mode (:root)**
- `--primary`: `211 75% 47%` --> `219 82% 33%` (#0F3C97 -- brand 700)
- `--ring`: match new primary
- `--sidebar-primary`: match new primary
- `--sidebar-ring`: match new primary
- Gradient start uses `var(--primary)` already, update endpoint from `hsl(216 80% 39%)` to `hsl(222 91% 21%)` (shade 900) for depth

**File: `src/components/layout/DynamicIconOnlySidebar.tsx`**
- Revert `bg-[#0F3C97]` back to `bg-primary` since primary is now #0F3C97

### What gets updated automatically
- Default buttons (`bg-primary`)
- Ascension buttons (`bg-primary`)
- Tab active indicators (`bg-primary` in ToggleButtonGroup)
- Search field blue circle (`bg-primary`)
- AI Hub floating trigger (`bg-primary`)
- Filter selected badges (`bg-primary/15`, `border-primary/30`)
- Tab border (`border-primary`)
- Focus rings
- All `text-primary` links and accents

### Dark mode
No changes -- dark mode already uses shade 200 (#A4D3FA) which provides proper contrast on dark backgrounds.

### Risk
Low -- purely CSS variable change. If any element appears too dark, we can selectively override just that element afterward.

