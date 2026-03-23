

## Fix Missing Chart in Volume Settings Target Volume Popover

### Problem
The `TargetVolumePopover` shows no chart because the `historical_months_data` field is never populated in the Volume Settings table data. The `SettingsTab.tsx` maps patient-volume API records to `VolumeOverrideRow` but omits parsing `last_12_month_volume_stats` into the `historical_months_data` array. The popover receives an empty array, so `chartData` is empty and the chart doesn't render.

### Fix

#### `src/pages/staffing/SettingsTab.tsx`
In the `tableData` useMemo (around line 56-95), parse `record.last_12_month_volume_stats` into `historical_months_data`:

1. Parse `last_12_month_volume_stats` (it can be a string or array) into an array of `{ month, volume, daysInMonth }` objects
2. Use `patient_volume_mthly` as the volume and derive `daysInMonth` from each `year_month`
3. Also derive `lowest_three_months` by sorting months by daily volume ascending and taking the first 3
4. Compute `spread_percentage` and `used_three_month_low` from the existing `dly_avg_volume_12mth` and `dly_avg_volume_3mth_low` fields

This ensures the popover receives real chart data and renders the historical volume line chart with highlighted lowest-3 months and reference lines.

### Files Changed
- `src/pages/staffing/SettingsTab.tsx`

