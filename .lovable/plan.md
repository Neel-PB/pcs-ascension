

## Volume UOS Badge — Connect All 6 KPIs

### Current State
The Volume breakdown badge sits centered below the grid with a single vertical connector line. The user wants it to mirror the Hired+Open Reqs pattern: vertical connector lines dropping from **all 6** Volume KPI columns, joined by a horizontal bar, then a single line down to the badge.

### Changes

**File: `src/components/staffing/DraggableKPISection.tsx`**

Replace the current simple centered Volume badge (lines 189-208) with a full-width grid-based connector layout:

1. Use `hidden xl:grid grid-cols-6` (matching the KPI grid) with `marginTop: 0`
2. Place the badge as `col-span-6`
3. Render the connector structure inside:
   - **Row 1** (grid-cols-6): A short vertical line (`w-0.5 h-2 bg-primary/60`) dropping from the center of each of the 6 columns
   - **Row 2** (grid-cols-6): A horizontal line spanning from column 1 center to column 6 center (using the same half-width trick as the Hired+Open Reqs pattern — first column: right half filled, middle columns: full width, last column: left half filled)
   - **Row 3**: Single centered vertical line (`w-0.5 h-1.5`) down to badge
   - **Row 4**: The blue pill badge (same as current)

All connector lines use `bg-primary/60 dark:bg-primary/70` to match the blue theme.

