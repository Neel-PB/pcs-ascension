

## Make Override Vol KPI Dynamic Based on Department Selection

### Problem

The Override Vol KPI card on the Summary tab always shows a hardcoded value of "24.7" regardless of filter selections. It should:

1. Show **"Select Dept"** when no specific department is selected (All Departments)
2. When a department IS selected, query the `volume_overrides` table for that department
3. If no override exists or the override is **expired**, show **"--"** (no data)
4. If a valid, non-expired override exists, show its value

### Changes

**File: `src/pages/staffing/StaffingSummary.tsx`**

1. Import `useVolumeOverrides` hook
2. Fetch volume overrides for the selected facility
3. In the `volumeKPIs` useMemo, make the `override-vol` entry dynamic:
   - If `selectedDepartment === "all-departments"` -> value = "Select Dept"
   - Else find the matching override for the selected department
   - If found and `expiry_date` is in the future -> show the `override_volume` value
   - If not found or expired -> value = "--"
4. Remove hardcoded chart data when there's no valid override (pass empty array)
5. Update the `definition` text contextually based on state

### Technical Details

| File | Change |
|------|--------|
| `src/pages/staffing/StaffingSummary.tsx` | Import `useVolumeOverrides`, add override lookup logic, make `override-vol` KPI value and highlight state dynamic based on selected department and override expiry |

### Logic Summary

```text
if (no department selected)
  -> value: "Select Dept", no chart, no highlight
else
  -> look up override for facility+department
  -> if override exists AND expiry_date > today
     -> value: override_volume, show chart, highlight green (active)
  -> else
     -> value: "--", no chart, no highlight
```

