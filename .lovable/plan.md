

## Move Filters Between Shortage and Surplus KPI Cards

### What Changes

The Skill and Shift filter dropdowns will move from below the KPI cards to sit **between** the Shortage card (left) and Surplus card (right), creating a single unified row.

### Layout

```text
[ Shortage Card ] [ Skill Filter ] [ Shift Filter ] [ Surplus Card ]
```

### Implementation

| File | Change |
|------|--------|
| `src/components/forecast/ForecastKPICards.tsx` | Change from `grid grid-cols-2` to accept a `children` slot rendered between the two cards. Use a flex row layout instead of grid so the filters sit naturally between the cards. |
| `src/pages/staffing/ForecastTab.tsx` | Move the Skill/Shift Select components from their own section into the `ForecastKPICards` component as children. Remove the standalone filter row. |

### Technical Details

**ForecastKPICards.tsx**
- Add `children?: React.ReactNode` to the props interface
- Change the container from `grid grid-cols-2 gap-6` to `flex items-center gap-4`
- Both cards get `flex-1` so they share available space equally
- Render `{children}` between the two cards
- The children slot will contain the filter selects and reset button

**ForecastTab.tsx**
- Remove the standalone filter `div` (lines 95-141)
- Pass the two Select components and reset button as children of `ForecastKPICards`
- Filter selects will use `flex-shrink-0` so they don't collapse
- Reduce select width slightly (e.g. `w-[150px]`) to fit between the cards comfortably

