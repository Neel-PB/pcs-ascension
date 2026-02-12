

## Sidebar Icon Size + Logo Navigation Fix

### Changes

**1. Increase sidebar nav icons from 20px to 24px**

In `src/components/layout/DynamicIconOnlySidebar.tsx` (line 90):
- Change `h-5 w-5` (20px) to `h-6 w-6` (24px) on the module icon

**2. Make Ascension logo navigate to home page on click**

In `src/components/layout/OrganizationSwitcher.tsx`:
- Wrap the logo in a `<Link>` (or use `useNavigate`) pointing to `/staffing` (the app's home route)
- Import `Link` from `react-router-dom`

### Files Modified

| File | Change |
|---|---|
| `src/components/layout/DynamicIconOnlySidebar.tsx` | Icon class `h-5 w-5` to `h-6 w-6` |
| `src/components/layout/OrganizationSwitcher.tsx` | Wrap logo in `<Link to="/staffing">` |

