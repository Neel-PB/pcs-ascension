

## Put FTE Surplus and FTE Shortage Legend on One Line

### What Changes
The legend next to the action buttons currently stacks vertically (two rows). Update it to display horizontally in a single row with a small separator between them.

### File to Change

**`src/pages/staffing/PositionPlanning.tsx`** (lines 910-922)

- Change the legend container from `flex flex-col gap-0.5` to `flex items-center gap-4` so both items sit side by side
- Remove the vertical stacking so "+ FTE Surplus" and "- FTE Shortage" appear on one horizontal line

