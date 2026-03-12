

## Fix: Always derive nursing status from API, not Supabase DB

### Problem
The `useDepartmentCategory` hook queries a Supabase `departments` table for `is_nursing`, but your real database is the PostgreSQL backend accessed via API. The Supabase table has stale/incorrect data (e.g., Dept 10276 marked nursing when it's not). The API's `nursing_flag` field is the actual source of truth.

### Fix

**File: `src/pages/staffing/PositionPlanning.tsx`** (~lines 510-568)

1. **Remove** the `useDepartmentCategory` import and hook call entirely
2. **Always** fetch skill-shift without `nursingFlag` filter when a department is selected (so we get all records)
3. **Always** auto-detect from API data's `nursing_flag` field when a department is selected

```typescript
// Remove: import { useDepartmentCategory } from "@/hooks/useDepartmentCategory";
// Remove: const { isNursing: departmentIsNursing } = useDepartmentCategory(...)

// Simplified logic:
const nursingFlag = isDepartmentSelected ? undefined : (staffCategory === 'nursing' ? 'Y' : 'N');

// Auto-detect effect: always run when department is selected (no DB gate)
useEffect(() => {
  if (isDepartmentSelected && skillShiftData && skillShiftData.length > 0 && !autoDetected) {
    const hasNursing = skillShiftData.some(r => r.nursing_flag === 'Y');
    const hasNonNursing = skillShiftData.some(r => r.nursing_flag === 'N');
    setStaffCategory(hasNonNursing && !hasNursing ? 'non-nursing' : 'nursing');
    setAutoDetected(true);
  }
}, [isDepartmentSelected, skillShiftData, autoDetected]);
```

### Scope
Single file edit (~15 lines changed). The `useDepartmentCategory` hook file can remain but will no longer be used here.

