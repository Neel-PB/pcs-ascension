

## Use Real `last_12_month_volume_stats` for Volume KPI Charts

**Problem**: Volume KPI charts use synthetic trend generators instead of real historical data. The API provides `last_12_month_volume_stats` with actual monthly values.

**Data mapping per user clarification**:
- **12M Average** and **Target Vol** → `patient_volume_mthly`
- **12M Daily Average**, **3M Low**, **3M High** → `patient_volume_dly`
- **Override Vol** → keep synthetic (no historical series)

### Changes

**1. `src/hooks/usePatientVolume.ts`** — Add field to interface

Add `last_12_month_volume_stats` to `PatientVolumeRecord`:
```typescript
last_12_month_volume_stats: Array<{
  year_month: string;
  patient_volume_dly: number;
  patient_volume_mthly: number;
}> | string | null;
```

**2. `src/pages/staffing/StaffingSummary.tsx`** — Parse, aggregate, and wire real data

Add a new `useMemo` block after `pvAgg` that:
- Parses `last_12_month_volume_stats` from each record in `pvFilteredRecords` (handle string JSON or array)
- Collects all unique `year_month` values, sorts ascending
- For each month, sums `patient_volume_mthly` and `patient_volume_dly` across all filtered records
- Produces: `monthlyTrend` (`{value}[]`), `dailyTrend` (`{value}[]`), and `trendLabels` (formatted "MMM'yy")

Replace chart data in the volume KPIs:
| KPI | `chartData` | Source field |
|-----|------------|--------------|
| 12M Average | `monthlyTrend` | `patient_volume_mthly` |
| 12M Daily Average | `dailyTrend` | `patient_volume_dly` |
| 3M Low | `dailyTrend` | `patient_volume_dly` |
| 3M High | `dailyTrend` | `patient_volume_dly` |
| Target Vol | `monthlyTrend` | `patient_volume_mthly` |
| Override Vol | keep `generateVolatileTrend` | unchanged |

Replace `generateLast12MonthLabels()` with `trendLabels` for these five KPIs. Override Vol keeps `monthLabels` from the old generator.

