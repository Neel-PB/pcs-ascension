
# Standardize Select 'All/None' Options Across the App

## Overview

Radix UI's `<Select.Item />` throws a runtime error if given an empty string (`""`) as a value. This plan standardizes all Select components in the application to use non-empty sentinel values (like `"all"`, `"none"`, `"unset"`) instead of empty strings, preventing crashes across the app.

---

## Current State Analysis

### Components Already Using Correct Pattern
These components already follow best practices and need no changes:

| File | Sentinel Used |
|------|---------------|
| `RBACAuditLog.tsx` | `"all"` |
| `FilterBar.tsx` | `"all-regions"`, `"all-markets"`, `"all-facilities"`, `"all-departments"`, `"all-submarkets"`, `"all-level2"`, `"all-pstat"` |
| `CombinedOptionalFilters.tsx` | Same as FilterBar |
| `EmployeesFilterSheet.tsx` | `"all"` |
| `ContractorsFilterSheet.tsx` | `"all"` |
| `RequisitionsFilterSheet.tsx` | `"all"` |
| `FeedbackPage.tsx` | `"all"` |
| `UserFormSheet.tsx` | Filters out empty role names (defensive) |

### Components Needing Updates

| File | Current Issue | Fix Required |
|------|---------------|--------------|
| `MessageComposer.tsx` | Uses `selectedRoles[0] \|\| ""` fallback | Change fallback to `"none"` sentinel |
| `ShiftCell.tsx` | Uses `""` for unset state, passes to Select | Change to `"unset"` sentinel with "No selection" option |

---

## Implementation Plan

### Step 1: Create a Shared Sentinel Constants File

Create a centralized constants file for commonly used Select sentinel values. This ensures consistency across the app and makes future updates easier.

**New file: `src/lib/selectConstants.ts`**

```typescript
/**
 * Standard sentinel values for Select components.
 * Radix UI throws if SelectItem value is "".
 * Always use these constants instead of empty strings.
 */
export const SELECT_ALL = "all" as const;
export const SELECT_NONE = "none" as const;
export const SELECT_UNSET = "unset" as const;

// Filter-specific sentinels (maintain existing patterns)
export const FILTER_SENTINELS = {
  ALL_REGIONS: "all-regions",
  ALL_MARKETS: "all-markets",
  ALL_FACILITIES: "all-facilities",
  ALL_DEPARTMENTS: "all-departments",
  ALL_SUBMARKETS: "all-submarkets",
  ALL_LEVEL2: "all-level2",
  ALL_PSTAT: "all-pstat",
} as const;
```

### Step 2: Fix MessageComposer.tsx

The Select value currently falls back to `""` when no roles are selected.

**Current code (line 123):**
```tsx
value={selectedRoles.includes("all") ? "all" : selectedRoles[0] || ""}
```

**Fixed code:**
```tsx
value={selectedRoles.includes("all") ? "all" : selectedRoles[0] || "none"}
```

Also add a "No selection" placeholder item to handle the `"none"` case:
```tsx
<SelectContent>
  <SelectItem value="none" disabled className="text-muted-foreground">
    Select recipients...
  </SelectItem>
  {roleGroups.map((role) => (
    <SelectItem key={role.value} value={role.value}>
      {role.label}
    </SelectItem>
  ))}
</SelectContent>
```

### Step 3: Fix ShiftCell.tsx

The component uses `""` to represent "no selection" and passes it directly to the Select.

**Current code:**
```tsx
const [localSelection, setLocalSelection] = useState<string>(selectedDayNight || "");
// ...
const handleReset = (e: React.MouseEvent) => {
  setLocalSelection("");
  onSave?.(null);
};
// ...
<Select value={localSelection} onValueChange={handleSelect}>
```

**Fixed code:**
```tsx
const UNSET = "unset" as const;
const [localSelection, setLocalSelection] = useState<string>(selectedDayNight || UNSET);
// ...
const handleReset = (e: React.MouseEvent) => {
  setLocalSelection(UNSET);
  onSave?.(null);
};

const handleSelect = (val: string) => {
  if (val === UNSET) return; // Ignore placeholder selection
  setLocalSelection(val);
  onSave?.(val);
};
// ...
<Select value={localSelection} onValueChange={handleSelect}>
  <SelectTrigger className="h-8 text-sm">
    <SelectValue placeholder="Select shift..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value={UNSET} disabled className="text-muted-foreground">
      Select shift...
    </SelectItem>
    <SelectItem value="day">Day</SelectItem>
    <SelectItem value="night">Night</SelectItem>
  </SelectContent>
</Select>
```

### Step 4: Defensive Validation in UserFormSheet.tsx (Already Done)

The current implementation already filters out empty role names:
```tsx
.filter((role) => role.name && role.name.trim() !== '')
```

No changes needed here.

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/lib/selectConstants.ts` | Shared sentinel constants for Select components |

### Modified Files
| File | Change |
|------|--------|
| `src/components/messaging/MessageComposer.tsx` | Replace `""` fallback with `"none"` sentinel |
| `src/components/editable-table/cells/ShiftCell.tsx` | Replace `""` state with `"unset"` sentinel |

---

## Testing Checklist

After implementation, verify:

1. **MessageComposer**: Open the message composer, confirm no crash when no recipients selected
2. **ShiftCell**: Open a special shift popover, confirm no crash when shift is unselected
3. **RBAC Audit Log**: Confirm filters work with "All" option
4. **All Filter Sheets**: Open Employees, Contractors, Requisitions filter sheets and use all dropdowns
5. **FilterBar**: Use all primary and optional filters in Staffing module

---

## Future Prevention

To prevent this issue from occurring in future development:

1. **Code Review Guideline**: Any new Select component must use a non-empty sentinel for "All/None/Unset" options
2. **Import Pattern**: Encourage importing from `@/lib/selectConstants` for standard sentinel values
3. **ESLint Rule (Optional)**: Consider adding a custom lint rule to flag `<SelectItem value="">` patterns

