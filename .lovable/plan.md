

## Fix: `.toFixed is not a function` — API returns string numbers

The patient-volume API returns numeric fields as strings (e.g., `"458.35"` instead of `458.35`). The `.reduce()` aggregation uses `??  0` which doesn't coerce strings, so `"458.35" + 0` produces `"458.350"` (string concatenation). When this string flows into `generateGrowthTrend` → `chartData` → `KPIChartModal`, the `.toFixed()` call fails because it's a string, not a number.

### Fix in `src/pages/staffing/StaffingSummary.tsx` (~lines 147-156)

Wrap each reduce accessor with `Number()` to coerce string values:

```typescript
const pvAgg = useMemo(() => {
  if (!patientVolumeData?.length) return null;
  return {
    mthly_avg_volume_12mth: patientVolumeData.reduce((s, r) => s + Number(r.mthly_avg_volume_12mth ?? 0), 0),
    dly_avg_volume_12mth: patientVolumeData.reduce((s, r) => s + Number(r.dly_avg_volume_12mth ?? 0), 0),
    dly_avg_volume_3mth_low: patientVolumeData.reduce((s, r) => s + Number(r.dly_avg_volume_3mth_low ?? 0), 0),
    dly_avg_volume_3mth_high: patientVolumeData.reduce((s, r) => s + Number(r.dly_avg_volume_3mth_high ?? 0), 0),
    target_volume: patientVolumeData.reduce((s, r) => s + Number(r.target_volume ?? 0), 0),
  };
}, [patientVolumeData]);
```

### Scope
Single file, ~5 lines changed.

