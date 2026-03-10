

## Fix: Aggregate patient volume across all records & restore charts

### Problem
1. Current code only uses `patientVolumeData?.[0]` — ignores all other records. When multiple departments/locations are returned, only the first record's values display.
2. Charts are conditionally empty (`mthly12 != null ? generateGrowthTrend(...) : []`) — so when API hasn't loaded or returns no data, charts disappear entirely. Previously they always showed with seeded data.

### Fix in `src/pages/staffing/StaffingSummary.tsx`

**Replace single-record lookup with aggregation:**

```typescript
// Instead of: const pvRecord = patientVolumeData?.[0] ?? null;
const pvAgg = useMemo(() => {
  if (!patientVolumeData?.length) return null;
  return {
    mthly_avg_volume_12mth: patientVolumeData.reduce((s, r) => s + (r.mthly_avg_volume_12mth ?? 0), 0),
    dly_avg_volume_12mth: patientVolumeData.reduce((s, r) => s + (r.dly_avg_volume_12mth ?? 0), 0),
    dly_avg_volume_3mth_low: patientVolumeData.reduce((s, r) => s + (r.dly_avg_volume_3mth_low ?? 0), 0),
    dly_avg_volume_3mth_high: patientVolumeData.reduce((s, r) => s + (r.dly_avg_volume_3mth_high ?? 0), 0),
    target_volume: patientVolumeData.reduce((s, r) => s + (r.target_volume ?? 0), 0),
  };
}, [patientVolumeData]);
```

**Restore charts — always generate seeded from value (fallback to previous hardcoded base):**

```typescript
// Before (broken): chartData: mthly12 != null ? generateGrowthTrend(...) : [],
// After: always generate chart, use API value or fallback
chartData: generateGrowthTrend((mthly12 ?? 633.5) * 0.9, mthly12 ?? 633.5, 30),
```

Same pattern for all 5 volume KPI cards — charts always render, seeded from real values when available, fallback when not.

### Scope
Single file edit: `src/pages/staffing/StaffingSummary.tsx` — lines ~147 and ~279-351

