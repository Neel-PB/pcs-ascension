

## Navigate to Correct Staffing Tab on "Go & Start"

### Problem
All staffing guides (Summary, Planning, Variance, Forecast, Volume Settings, NP Settings) navigate to `/staffing` but always land on the default "summary" tab because the page uses local `useState("summary")` -- there's no way to tell it which tab to activate.

### Solution
Use URL search params (`?tab=planning`, `?tab=variance`, etc.) to drive the active tab. This way, "Go & Start" can navigate to `/staffing?tab=planning` and the page opens directly on that tab.

### Technical Changes

#### 1. `src/components/support/UserGuidesTab.tsx`
- Update `route` values in `guideCatalog` for staffing sub-tours:
  - `staffing` stays `/staffing` (defaults to summary)
  - `staffing-planning` changes to `/staffing?tab=planning`
  - `staffing-variance` changes to `/staffing?tab=variance`
  - `staffing-forecast` changes to `/staffing?tab=forecasts`
  - `staffing-volume-settings` changes to `/staffing?tab=volume-settings`
  - `staffing-np-settings` changes to `/staffing?tab=np-settings`

#### 2. `src/pages/staffing/StaffingSummary.tsx`
- Import `useSearchParams` from `react-router-dom`
- Read the `tab` search param on mount
- If a valid `tab` param exists, use it as the initial value for `activeTab` instead of `"summary"`
- When `activeTab` changes via the toggle group, optionally clear the search param so it doesn't get stale

### Resulting Flow
1. User clicks "Go & Start" on "Position Planning" guide
2. App navigates to `/staffing?tab=planning`
3. StaffingSummary reads `tab=planning` and sets `activeTab` to `"planning"`
4. Page renders with the Planning tab active
5. Tour starts targeting Planning-specific elements
