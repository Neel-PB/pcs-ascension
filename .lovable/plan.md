

## Add Skill Type and Shift Filters to Forecast Tab

### Problem

The Forecast tab currently shows KPI cards and a table with no way to filter by Skill Type or Shift. The user wants two Select dropdowns placed between the KPI cards and the table, using the app's standard Helix select styling.

### Changes

| File | Change |
|------|--------|
| `src/pages/staffing/ForecastTab.tsx` | Add `selectedSkillType` and `selectedShift` state, extract unique values from `data.rows`, add two Select dropdowns in a new row between KPI cards and table, apply client-side filtering |

### Details

**Filter Row Layout**
- Place a `div` with `flex items-center gap-3 flex-shrink-0` between the KPI cards and the table
- Two Select components side by side:
  1. **Skill** (label text) -- values derived from unique `skillType` in `data.rows`
  2. **Shift** -- values derived from unique `shift` in `data.rows` (Day, Night)
- Include a clear/reset button (X icon) to reset both filters, matching existing FilterBar pattern

**Select Styling (Helix standard)**
- Trigger: `rounded-lg border-2 border-input px-4 py-3` with blue brand chevron (`text-[#1D69D2]`)
- Default value: "All Skills" / "All Shifts" using sentinel constants
- Selection highlight: `bg-primary/15` (no checkmarks)

**Filtering Logic**
- Two `useState` hooks: `selectedSkillType` (default `"all"`) and `selectedShift` (default `"all"`)
- Applied to existing `filteredRows` computation alongside the shortage/surplus filter
- Unique skill types and shifts extracted via `useMemo` from `data?.rows`

**No backend changes needed** -- purely client-side filtering on already-fetched data.

