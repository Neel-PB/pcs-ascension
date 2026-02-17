

## Navigate to Correct Admin Tab on "Go & Start"

### Problem
All five Admin guides (Users, Feed, RBAC, Audit Log, Settings) navigate to `/admin` but always land on the default "users" tab. Clicking "Go & Start" on Feed, RBAC, Audit Log, or Settings doesn't switch to the correct tab.

### Solution
Apply the same pattern used for Staffing and Positions: use URL search params and read them on mount.

### Technical Changes

#### 1. `src/components/support/UserGuidesTab.tsx`
Update `route` values in `guideCatalog` for admin sub-tours:
- `admin-users` stays `/admin` (defaults to users)
- `admin-feed` changes to `/admin?tab=feed`
- `admin-rbac` changes to `/admin?tab=access-control`
- `admin-audit` changes to `/admin?tab=audit-log`
- `admin-settings` changes to `/admin?tab=settings`

#### 2. `src/pages/admin/AdminPage.tsx`
- Import `useSearchParams` from `react-router-dom`
- Read the `tab` search param on mount
- If a valid tab param exists (`users`, `feed`, `access-control`, `audit-log`, `settings`), use it as the initial value for `activeTab`
- Add a `useEffect` to clear the search param after consumption

### Resulting Flow
1. User clicks "Go & Start" on the "Admin Feed" guide
2. App navigates to `/admin?tab=feed`
3. AdminPage reads `tab=feed` and sets `activeTab` to `"feed"`
4. Page renders with the Feed tab active
5. Tour starts targeting Feed-specific elements

