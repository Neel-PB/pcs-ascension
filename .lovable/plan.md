

## Make Settings Sub-Tabs Full Width

### Change

**File: `src/pages/admin/AdminPage.tsx`**

Remove the `max-w-md` width constraint from the TabsList wrapper so the two sub-tabs (UI Settings / Volume Config) span the full available width.

- Remove the `<div className="w-full max-w-md">` wrapper around `TabsList`
- Add `w-full` to the `TabsList` component itself
- Ensure each `TabsTrigger` uses `flex-1` to split the width equally

### Result
- The "UI Settings" and "Volume Config" tabs will stretch across the full content width instead of being constrained to ~448px
