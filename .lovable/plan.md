

## Revert Tab Style, Keep Full-Width

### Problem
The original underline-style tabs were correct -- you only wanted them stretched to full width. The last edit incorrectly replaced them with a pill-shaped ToggleButtonGroup, changing the entire visual style.

### Fix

**File: `src/components/workforce/WorkforceKPISection.tsx`**

Revert back to the original `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` implementation, but add `w-full` to the `TabsList` and `flex-1` to each `TabsTrigger` so the tabs stretch across the full width evenly.

Specifically:
- Restore imports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs` and `Badge` from `@/components/ui/badge`
- Remove `ToggleButtonGroup` import and `checklistTab` state
- Restore the original `Tabs` markup with these additions:
  - `TabsList`: add `w-full` class
  - Each `TabsTrigger`: add `flex-1` class so they split the width equally
- Keep the Shortage/Surplus badge counts as before

This preserves the underline tab style while making them span the full container width.

