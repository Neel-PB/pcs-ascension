

## Restyle Hired/Active and Nursing/Non-Nursing Toggles

### Goal
Update the two inline toggles in the Planned/Active Resources tab (Hired | Active and Nursing | Non-Nursing) to use the app's standard pill-shaped outlined toggle button style, while keeping their current compact size.

### Current State
- Both toggles use a custom implementation with `rounded-xl bg-background shadow-soft` container and `rounded-md` buttons with gradient backgrounds
- The app's standard tab style uses a `rounded-full` container with a `border-2 border-primary` outline and `bg-primary` active indicator

### Changes

**File: `src/pages/staffing/PositionPlanning.tsx`**

1. **Hired/Active toggle (lines 763-836)**: Replace the custom toggle markup with the `ToggleButtonGroup` component, using a smaller variant styling:
   - Container: `rounded-full border-2 border-primary p-1` (matching app tab style)
   - Active state: `bg-primary text-primary-foreground` (solid primary, not gradient)
   - Inactive state: `text-foreground hover:bg-muted/50`
   - Keep existing `px-3 py-1 text-xs` sizing so dimensions don't change
   - Preserve tooltip wrappers around each button

2. **Nursing/Non-Nursing toggle (lines 846-927)**: Same treatment as above
   - Apply the same outlined pill style
   - Keep compact sizing
   - Preserve tooltip wrappers

Since the `ToggleButtonGroup` component doesn't support tooltips on individual items, I'll restyle the existing custom buttons in-place rather than swapping to the shared component. This keeps tooltips intact while matching the visual style:
   - Container: Change from `rounded-xl bg-background p-1 shadow-soft` to `rounded-full border-2 border-primary p-1`
   - Buttons: Change from `rounded-md` to `rounded-full`
   - Active indicator: Change from `bg-gradient-primary rounded-md` to `bg-primary rounded-full`
   - Transition: Change from spring to tween (0.2s easeOut) to match tab standard
   - Remove `whileHover` scale and `whileTap` scale effects for consistency

### Files Modified

| File | Change |
|---|---|
| `src/pages/staffing/PositionPlanning.tsx` | Restyle both toggle containers and buttons to match outlined pill tab style |

