

## Highlight 3 Lowest/Highest Points on 3M Low/High Volume Charts

### Problem
The 3M Low and 3M High KPI charts show the same 12-month trend line but don't visually indicate which 3 months are the lowest or highest. The user wants dots marking those specific months.

### Changes

#### 1. `src/components/staffing/KPIChartModal.tsx`

**Add new prop** `highlightPoints?: 'lowest-3' | 'highest-3'` to the component interface.

**In `enrichedData` memo**, after building the data array, if `highlightPoints` is set, compute which 3 indices have the lowest or highest values and add an `isHighlighted: true` flag to those entries.

**In the Area chart section**, add a `ReferenceDot` for each highlighted point (or use a custom `dot` render function on the `<Area>` component that renders a larger colored dot for highlighted points only):
- **3M Low**: 3 dots at the lowest values, colored red/orange
- **3M High**: 3 dots at the highest values, colored green/blue

#### 2. `src/pages/staffing/StaffingSummary.tsx`

**Lines 726-740 (3M Low)**: Add `highlightPoints: 'lowest-3'` to the KPI config object.

**Lines 742-755 (3M High)**: Add `highlightPoints: 'highest-3'` to the KPI config object.

#### 3. `src/config/kpiConfigs.ts`

**Add `highlightPoints`** to the `KPIConfig` type interface so it flows through the KPI card and chart modal.

#### 4. `src/components/staffing/KPICard.tsx` and `src/components/workforce/WorkforceKPICard.tsx`

**Pass through** the new `highlightPoints` prop to `KPIChartModal`.

### Visual Result
- 3M Low chart: 12-month area trend with 3 large colored dots on the 3 lowest months
- 3M High chart: 12-month area trend with 3 large colored dots on the 3 highest months

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`
- `src/pages/staffing/StaffingSummary.tsx`
- `src/config/kpiConfigs.ts`
- `src/components/staffing/KPICard.tsx`
- `src/components/workforce/WorkforceKPICard.tsx`

