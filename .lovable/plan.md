

## Fix Users Table Icons and Improve Usability

### Changes

**File: `src/components/admin/UserManagementTable.tsx`**

**1. Fix action icons**
- The `Pencil` and `Trash2` icons are Material Design icons from `react-icons/md`. When used inside `Button size="icon"`, they can render at inconsistent sizes since react-icons uses `size` prop differently than lucide.
- Switch action icons to use `size={16}` prop directly on the icon components for consistent 16px rendering.
- Use `MdOutlineEdit` and `MdOutlineDeleteOutline` (outlined variants) for a cleaner look matching the app's outlined icon convention.
- Import `MdOutlineDeleteOutline` via the icons adapter (or use Trash2 with explicit size).

**2. Make the table more usable**
- Add a user count summary below the search (e.g., "Showing 5 users")
- Improve row hover interaction -- make the edit action more discoverable by showing a subtle edit cursor on row click (wire `onEdit` to row click)
- Add `whitespace-nowrap` to the Email and Created columns to prevent wrapping
- Make the Actions column narrower with `w-[100px]`
- Add `text-xs` to the Created date for a more compact feel
- Use `rounded-xl` and `overflow-hidden` on the table container to match the app's standard table styling
- Add role display names for all roles (nurse_manager -> "Nurse Manager", etc.) using underscore-to-title-case conversion

**3. Improve role display helper**
- Update `getRoleDisplayName` to properly convert snake_case to Title Case for all roles (e.g., `nurse_manager` -> `Nurse Manager`)

### Files Affected
- `src/components/admin/UserManagementTable.tsx` -- icon fixes, table styling, role display
- `src/pages/admin/UsersManagement.tsx` -- add user count display

