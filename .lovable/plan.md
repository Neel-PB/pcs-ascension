

## Add Permission-Based Filtering to TourLauncher

### Problem
The "All Tours" sheet (`TourLauncher.tsx`) in the user menu shows all tours regardless of the user's role/permissions. The `UserGuidesTab` already filters tours by category permissions, guide-level permissions, overlay permissions, and KPI visibility — but the TourLauncher doesn't use any of this logic.

### Fix — `src/components/tour/TourLauncher.tsx`

Apply the same filtering that `UserGuidesTab` uses:

1. **Import** `useRBAC`, `useAuth`, `useUserRoles`, and `isKpiVisible`.
2. **Reuse the same permission maps** (category, guide-level, overlay) from UserGuidesTab — extract or duplicate:
   - `categoryPermissionMap`: Staffing→`staffing.access`, Positions→`positions.access`, Admin→`admin.access`, etc.
   - `guidePermissionMap`: `staffing-volume-settings`→`settings.volume_override`, `staffing-np-settings`→`settings.np_override`
   - `overlayPermissionMap`: `feedback`→`feedback.access`
3. **Filter `GROUPS` sections** so each group only shows tours the user has permission to see:
   - Check category permission for the group
   - Check guide-level and overlay-level permissions for individual sections
4. **Filter KPI steps** for the staffing tour based on `isKpiVisible` + user roles (same as UserGuidesTab lines 152-160).
5. **Hide empty groups** — if all sections in a group are filtered out, hide the group header.

### Scope
- Single file change: `src/components/tour/TourLauncher.tsx`
- No new dependencies — reuses existing hooks and config already used in UserGuidesTab

