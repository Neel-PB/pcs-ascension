

## Fix Day/Night Data Mismatch in Nested Pie KPI Charts & Tables

### Root Cause
The data is correctly structured: `inner` = Night, `outer` = Day (set in `StaffingSummary.tsx`). The chart legend correctly says "Inner: Night, Outer: Day". But the **footer totals** and **table columns** have them backwards — `inner` is labeled "Day" and `outer` is labeled "Night".

### Changes — `src/components/staffing/KPIChartModal.tsx`

**Fix 1: Chart footer totals (line 1202-1209)**
- Line 1203: Change label from `{group.category} Day` to `{group.category} Night`
- Line 1204: Keep using `group.inner?.total` (which IS Night)
- Line 1207: Change label from `{group.category} Night` to `{group.category} Day`  
- Line 1208: Keep using `group.outer?.total` (which IS Day)

**Fix 2: Table footer totals (line 1447-1454)** — same swap as Fix 1.

**Fix 3: Table data columns (lines 1336-1339)**
Swap inner/outer so columns match their headers:
- `nrsDay` → read from `nrsGroup?.outer?.slices` (was `inner`)
- `nrsNight` → read from `nrsGroup?.inner?.slices` (was `outer`)
- `nonNrsDay` → read from `nonNrsGroup?.outer?.slices` (was `inner`)
- `nonNrsNight` → read from `nonNrsGroup?.inner?.slices` (was `outer`)

After this fix, chart hover values, footer totals, and table data will all consistently show Inner=Night, Outer=Day.

