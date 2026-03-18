

## Hide Target FTE Chart for Non-Nursing Selections

### Problem
When a user selects a non-nursing department (or a facility with only non-nursing departments), the Target FTE KPI card still shows the chart icon. Since Target FTE pie charts only contain nursing skill-mix data, the chart would be empty or misleading for non-nursing selections.

### Solution

**File: `src/pages/staffing/StaffingSummary.tsx`**

1. **Detect if current data has any nursing records** — add a `hasNursingData` memo that checks if any record in `skillShiftData` has `nursing_flag` = Y/true/1. This is more reliable than checking the department table since it uses the actual API data.

2. **Conditionally set `chartData` for Target FTEs** — when `hasNursingData` is false, pass `chartData: []` (same pattern used for FTE Variance and Req Variance), which hides the chart icon. When nursing data exists, keep the existing pie chart data.

3. **The eye icon stays in bottom-right** — already handled by the previous fix; no changes needed to `KPICard.tsx`.

### Code change (~3 lines added)

In the memos section (~line 258), add:
```typescript
const hasNursingData = useMemo(() => {
  if (!skillShiftData?.length) return false;
  return skillShiftData.some(r => {
    const nf = String(r.nursing_flag).toLowerCase();
    return nf === 'y' || nf === 'true' || nf === '1';
  });
}, [skillShiftData]);
```

In the Target FTEs KPI config (~line 367), change `chartData`:
```typescript
chartData: hasNursingData && skillMixPieData.target.length > 0
  ? skillMixPieData.target
  : [],
```

This removes both the chart icon and chart data when viewing non-nursing selections, while preserving the full pie chart for nursing departments.

