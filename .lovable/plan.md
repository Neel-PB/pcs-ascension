

## Filter volume KPI roll-up by aggregatable P-stats when no department is selected

### Problem
When no department is selected, the volume KPIs aggregate **all** records. Only certain P-stat types (Patient Days, Patient Days + OBS, Patient Days + OBS + Newborns) can be meaningfully rolled up; others should be excluded from the sum.

### Change

**`src/pages/staffing/StaffingSummary.tsx`** — `pvAgg` memo (~lines 147-156)

Before aggregating, filter `patientVolumeData` to only include records whose `unit_of_service` (or `pstat`) matches the allowed roll-up values — but **only when no specific department is selected** (`selectedDepartment === 'all-departments'`). When a department IS selected, aggregate all records as before (since they're already scoped to one department).

```typescript
const ROLLUP_PSTATS = new Set([
  'Patient Days',
  'Patient Days + OBS',
  'Patient Days + OBS + Newborns',
]);

const pvAgg = useMemo(() => {
  if (!patientVolumeData?.length) return null;

  const noDept = selectedDepartment === 'all-departments';
  const records = noDept
    ? patientVolumeData.filter(r => ROLLUP_PSTATS.has(r.unit_of_service))
    : patientVolumeData;

  if (!records.length) return null;

  return {
    mthly_avg_volume_12mth: records.reduce(...),
    dly_avg_volume_12mth:   records.reduce(...),
    dly_avg_volume_3mth_low: records.reduce(...),
    dly_avg_volume_3mth_high: records.reduce(...),
    target_volume:           records.reduce(...),
  };
}, [patientVolumeData, selectedDepartment]);
```

### Scope
Single file edit: `StaffingSummary.tsx`, ~10 lines changed in the `pvAgg` memo.

