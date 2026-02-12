

## Fix Users Table Internal Scrolling

The page currently allows the entire content area to scroll because the height chain from the shell layout down to the table is not constrained. The fix follows the same pattern used in the Positions module: apply `overflow-hidden`, `min-h-0`, and `flex` constraints on all intermediate containers so the `VirtualizedTableBody` becomes the sole scroll container.

### Changes

**1. `src/pages/admin/AdminPage.tsx`**
- Change the root `<div className="space-y-6">` to a flex column that fills the available height: `flex flex-col h-full overflow-hidden`
- Change the content container (`<div className="space-y-6">` wrapping tab content) to `flex-1 min-h-0 overflow-hidden` so it gives the active tab a bounded height

**2. `src/pages/admin/UsersManagement.tsx`**
- Change the root `<div className="space-y-6">` to `flex flex-col h-full overflow-hidden gap-4`
- Keep the header, search, and count as fixed-height elements
- Make the `UserManagementTable` wrapper take remaining space with `flex-1 min-h-0`

**3. `src/components/admin/UserManagementTable.tsx`**
- Add `h-full` to the `EditableTable` wrapper so it fills the flex container, allowing the virtualized body inside to scroll

### Result
- The header, search bar, and user count remain fixed at the top
- The table fills the remaining vertical space and scrolls internally
- The outer page no longer scrolls when viewing the Users tab
