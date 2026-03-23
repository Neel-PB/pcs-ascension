

## Update Productive Resources KPI: 7-day → 28-day Daily Time Series

### Summary
The API now returns 28 daily records (last 2 completed pay periods) per department instead of 7 day-of-week records. The data model, deduplication, and chart aggregation need to be updated accordingly.

### Changes

#### 1. Update `useProductiveResourcesKpi.ts` — Data model & deduplication
- Replace `day_of_week: string | number` with `date: string` (ISO date) in `ProductiveResourcesKpiRecord`
- Update deduplication key from `market_hierarchy_key|department_id|day_of_week` to `market_hierarchy_key|department_id|date`

#### 2. Update `StaffingSummary.tsx` — Aggregation & chart logic
- **prAgg** (lines 184-198): No change needed — already SUMs all records, which works for 28-day data
- **nonNursingTarget** (lines 360-368): Already SUMs `target_fte` across all records — correct for 28-day data
- **paidByDept / npByDept** (lines 272-319): Already SUM/weighted-average across all records — correct
- **dayOfWeekData → dailyTrendData**: Replace the 7-day day-of-week aggregation (lines 321-357) with a 28-day date-based aggregation:
  - Group by date string instead of day name
  - Sort chronologically
  - Generate 28 data points for charts
  - Update `DAY_ORDER`/`DAY_LABELS_SHORT` → date-based labels (e.g., "Mar 1", "Mar 2", ...)
- **Productivity KPIs** (lines 728-838): Update chart data references and `xAxisLabels` from `DAY_LABELS_SHORT` to the 28-day date labels

#### 3. Update memory context
- The existing memory note `architecture/productive-resources-api-deduplication` references "7-day record structure" and `day_of_week` — this will be outdated after the change

### Technical Details
- The `prAgg` reducer already does simple SUM across all records for additive metrics and weighted NP% — this naturally works with 28 records instead of 7
- Charts will show 28 daily data points instead of 7 day-of-week points, providing more granular trend visibility
- Date labels will use short format (e.g., "3/1", "3/2") to fit in chart X-axis

