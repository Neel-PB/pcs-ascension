

## Align Users Table with Positions Module Pattern

### Goal
Replace the HTML-based `<Table>` in the Users management with the `EditableTable` component used in the Positions module, ensuring a consistent look and feel across the app.

### Changes

**1. Create User Column Definitions (`src/config/userColumns.tsx`)**

Define columns using the same `ColumnDef` pattern as `employeeColumns.tsx`:
- **User** (width: 280px) -- custom cell with Avatar + full name, locked column
- **Email** (width: 260px) -- text cell
- **Roles** (width: 200px) -- custom cell rendering Badge pills
- **Created** (width: 160px) -- date cell formatted as "MMM d, yyyy"
- **Actions** (width: 100px) -- custom cell with Edit and Delete icon buttons (non-sortable, non-draggable)

Each column will use appropriate cell components (`TruncatedTextCell`, `BadgeCell`, custom renders) matching the Positions pattern.

**2. Refactor `UserManagementTable.tsx`**

- Replace the `<Table>` / `<TableRow>` / `<TableCell>` markup with `<EditableTable>`
- Pass the new column definitions, user data, sort state, and row click handler
- Move the delete confirmation `AlertDialog` into the Actions column's custom `renderCell`
- Use `storeNamespace="admin-users-columns-v1"` for column state persistence
- Keep the existing loading and empty states

**3. Update `UsersManagement.tsx`**

- Add sort state (`sortColumn`, `sortDirection`) and pass to `UserManagementTable`
- The search, count display, and sheet logic remain unchanged

### Result
- Users table gets the same grid layout, sticky headers, proportional column scaling, hover states, and alternating row styles as the Employees table
- Sortable columns (User, Email, Roles, Created)
- Consistent row height (h-12), cursor-pointer on rows, and muted hover background
- Action icons remain in a non-sortable, non-draggable last column

### Files Affected
- **New**: `src/config/userColumns.tsx`
- **Modified**: `src/components/admin/UserManagementTable.tsx`
- **Modified**: `src/pages/admin/UsersManagement.tsx`

