

## Staffing Summary Performance Optimization Plan

### Root Causes Identified

1. **All 4 API calls fire regardless of active tab** — skill-shift (50k records), productive-resources-kpi (50k), patient-volume (paginated), and employment-split (50k) all fetch even when viewing Planning, Variance, Forecasts, or Settings tabs that don't use this data.

2. **Patient Volume uses sequential pagination** — loops `while(true)` fetching 1k records per page, causing waterfall network requests. The other hooks already use single `take=50000` fetches.

3. **`Math.random()` in chart generators** — `generateGrowthTrend`, `generateVolatileTrend`, etc. produce different data on every call, defeating memoization and causing unnecessary re-renders of KPI cards and charts.

4. **Missing query optimizations on 2 hooks** — `useSkillShift` and `usePatientVolume` lack `retry: 1` and `refetchOnWindowFocus: false`, causing extra network requests on tab switches.

5. **1109-line monolith component** — All ~15 `useMemo` aggregations run on every render even when the Summary tab isn't active, because hooks can't be conditional.

### Changes

**1. Gate API fetches to Summary tab only**

In `StaffingSummary.tsx`, add `activeTab === 'summary'` to the `enabled` flag for all 4 data hooks:
```tsx
enabled: filtersInitialized && activeTab === 'summary',
```
This prevents fetching 200k+ records when the user is on Planning, Variance, or Settings tabs. The data will be cached by React Query when switching back.

**2. Switch Patient Volume to single-fetch (like other hooks)**

In `usePatientVolume.ts`, replace the pagination loop with a single `take=50000` fetch, matching the pattern used by `useSkillShift` and `useProductiveResourcesKpi`. The API ignores `offset` anyway (per project memory), so pagination adds latency without benefit.

**3. Stabilize chart data generators**

In `kpiConfigs.ts` and `StaffingSummary.tsx`, replace `Math.random()` calls in `generateGrowthTrend`, `generateVolatileTrend`, `generateDeclineTrend`, `generateSeasonalTrend` with deterministic functions using seeded pseudo-random (index-based sine perturbation). This ensures chart data stays referentially stable across renders.

**4. Add missing query optimizations**

In `useSkillShift.ts` and `usePatientVolume.ts`, add `retry: 1` and `refetchOnWindowFocus: false` to match `useProductiveResourcesKpi`.

**5. Extract Summary tab into its own component**

Move all the aggregation `useMemo` hooks and the Summary JSX from `StaffingSummary.tsx` into a new `StaffingSummaryTab.tsx` component. This way, React only mounts the aggregation logic when the Summary tab is active, and unmounts it (freeing memory) when switching tabs.

### Expected Impact

- **~75% fewer API calls** when not on Summary tab (4 requests eliminated)
- **Faster patient-volume fetch** — single request vs. multi-page waterfall
- **Fewer re-renders** — stable chart data prevents KPI card re-renders
- **Lower memory** — aggregation logic unmounts when switching tabs
- **Faster tab switches** — no background refetching on window focus

