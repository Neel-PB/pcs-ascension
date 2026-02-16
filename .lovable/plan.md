

## Add Actions and Access Scope Steps to Admin Users Tour

### Overview
Extend the Admin Users tour from 4 steps to 6 steps by adding guidance for the Actions column (edit/delete buttons) and the Access Scope Restrictions section inside the User Form Sheet.

### New Steps

5. **Actions Column** -- `[data-tour="admin-users-actions"]` -- "Use the edit (pencil) icon to open a user's profile, or the delete (trash) icon to permanently remove their account. Deletion requires confirmation."

6. **Access Scope** -- `[data-tour="admin-users-scope"]` -- "Expand the Access Scope Restrictions section to limit which Regions, Markets, Facilities, and Departments a user can access. Selections cascade: choosing a Region filters available Markets."

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Append 2 new steps to `adminUsersTourSteps` after the existing User Table step (after line 286)

#### `src/config/userColumns.tsx`
- Add `data-tour="admin-users-actions"` to the Actions column header via `renderHeader`

#### `src/components/admin/UserFormSheet.tsx`
- Add `data-tour="admin-users-scope"` on the Access Scope `Collapsible` wrapper element

