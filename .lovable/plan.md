

## Forecast Drill-Down Panel — New API Fields Integration

### Problem
The API now provides new fields (`empltype_split_hired_open`, `pos_nbr_to_close`, `overall_status`, updated `staffing_status` values) that enable per-employment-type actions in the expanded panel. The current code doesn't use these fields.

### API Field Assumptions (inferred from spec)
- `overall_status`: string — row-level status for color/label (shortage/surplus/balanced)
- `staffing_status`: now per-employment-type action (`pos_to_close` / `pos_to_open` / balanced)
- `empltype_split_hired_open`: JSON array — `[{employment_type, hired_fte, open_reqs_fte}, ...]`
- `pos_nbr_to_close`: JSON array of position numbers — `[578293, 578284, ...]`

### Changes

**1. `src/hooks/useForecastBalance.ts`**

- Add new fields to `ForecastApiRow`: `overall_status`, `empltype_split_hired_open`, `pos_nbr_to_close`
- Add new interface `ForecastSubRow` (per-employment-type row with `staffingStatus`, `actionType`, `addressedFte`, `unaddressedFte`, `fteHeadcountJson`, `posNbrToClose`)
- Add to `ForecastBalanceRow`: `subRows: ForecastSubRow[]`, `empltypeSplitHiredOpen: EmpTypeSplit[]`, `overallStatus`
- During grouping: use `overall_status` for the row-level status (instead of `worstStatus` logic). Collect each API row as a sub-row preserving its employment_type-specific `staffing_status`, `pos_nbr_to_close`, and `fte_headcount_json`. Parse and merge `empltype_split_hired_open` arrays.

**2. `src/components/forecast/BalanceTwoPanel.tsx`**

**Left Panel:**
- Use `empltypeSplitHiredOpen` to show FT/PT/PRN breakdown (always show all 3, missing = 0)
- Two columns: Hired FTE and Open Reqs, each with 3 employment type rows

**Right Panel:**
- **Header**: FTE Gap = `totalFteReq` with +/- sign, Current FTE = hired + open reqs, Target FTE
- **Position to Close**: Filter `subRows` where `staffingStatus === 'pos_to_close'`, group by employment type, show count from `posNbrToClose` with optional expandable list
- **Position to Open**: Filter `subRows` where `staffingStatus === 'pos_to_open'`, group by employment type, render `fteHeadcountJson` breakdown (FTE × HC format)
- Show both sections when both exist, hide section if no data, show "No action required" if neither exists
- Display order: Close first, then Open

**Summary text**: Uses `empltypeSplitHiredOpen` to compute current FT/PT/PRN mix percentages instead of `fteHeadcountJson`

**3. `src/components/forecast/ForecastBalanceTableRow.tsx`**
- Row status color/label uses `overallStatus` (mapped via existing `staffingStatus` field on the grouped row) — no change needed if we map `overall_status` → `staffingStatus` during grouping

### Files Modified
1. `src/hooks/useForecastBalance.ts` — new interfaces, sub-row collection, `empltype_split_hired_open` / `pos_nbr_to_close` / `overall_status` mapping
2. `src/components/forecast/BalanceTwoPanel.tsx` — left panel uses `empltypeSplitHiredOpen`, right panel driven by sub-row `staffing_status` with `pos_nbr_to_close` for closes and `fte_headcount_json` for opens

