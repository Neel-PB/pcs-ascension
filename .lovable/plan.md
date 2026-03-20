

## Use Daily Trend for Target Vol Chart

### Change
**File: `src/pages/staffing/StaffingSummary.tsx`** — Line 677

Change the Target Vol `chartData` from `monthlyTrend` to `dailyTrend`:

```
// From
chartData: monthlyTrend.length > 0 ? monthlyTrend : (targetVol != null ? generateSeasonalTrend(...) : []),

// To
chartData: dailyTrend.length > 0 ? dailyTrend : (targetVol != null ? generateSeasonalTrend(...) : []),
```

This aligns the Target Vol sparkline chart with `patient_volume_dly` from the historical stats, matching the daily granularity of the Target Vol value itself (which is a daily average).

Single line change.

