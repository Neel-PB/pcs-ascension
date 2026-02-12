

## Admin Module Cleanup

### Changes

**File: `src/pages/admin/AdminPage.tsx`**

1. **Remove icons from tabs** -- Remove all `icon` properties from the tabs array and remove the icon imports (`Shield`, `Upload`, `Users`, `Settings`, `MessageSquare`, `History`) that are only used for tabs (keep `Shield` since it's used in the permission-denied section).

2. **Remove Data Import tab entirely**:
   - Remove the `{ id: "data-import", ... }` entry from the tabs array
   - Remove the `DataImportPage` import
   - Remove the `{activeTab === "data-import" && <DataImportPage />}` render block
   - Change default `activeTab` state from `"data-import"` to `"users"`

3. **Resulting tabs array** (no icons):
   - Users
   - Feed
   - RBAC
   - Audit Log
   - Settings

### Files Affected
- `src/pages/admin/AdminPage.tsx` -- the only file that needs changes

The `DataImportPage.tsx` and `FileUploadZone.tsx` files will be left in place (they can be cleaned up separately if desired) since removing files is a separate concern.

