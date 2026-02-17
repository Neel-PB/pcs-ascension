

## Navigate to Correct Positions Tab on "Go & Start"

### Problem
All three Positions guides (Employees, Contractors, Open Positions) navigate to `/positions` but always land on the default "employees" tab because the page uses `useState("employees")`. Clicking "Go & Start" on the Contractors or Open Positions guide doesn't switch to the correct tab.

### Solution
Apply the same pattern used for Staffing: use URL search params (`?tab=contractors`, `?tab=requisitions`) to drive the initial active tab.

### Technical Changes

#### 1. `src/components/support/UserGuidesTab.tsx`
- Update `route` values in `guideCatalog` for positions sub-tours:
  - `positions-employees` stays `/positions` (defaults to employees)
  - `positions-contractors` changes to `/positions?tab=contractors`
  - `positions-requisitions` changes to `/positions?tab=requisitions`

#### 2. `src/pages/positions/PositionsPage.tsx`
- Import `useSearchParams` from `react-router-dom`
- Read the `tab` search param on mount
- If a valid tab param exists (`employees`, `contractors`, `requisitions`), use it as the initial value for `activeTab`
- Add a `useEffect` to clear the search param after consumption so it doesn't get stale

### Resulting Flow
1. User clicks "Go & Start" on the Contractors guide
2. App navigates to `/positions?tab=contractors`
3. PositionsPage reads `tab=contractors` and sets `activeTab` to `"contractors"`
4. Page renders with the Contractors tab active
5. Tour starts targeting Contractors-specific elements

