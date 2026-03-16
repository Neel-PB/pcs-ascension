

## Fix: Duplicate Departments in Access Scope Dropdowns

### Root Cause

The `useFilterData` hook deduplicates departments using a **composite key** (`department_id|business_unit`), so the same department (e.g., "Emergency") appears once per facility it belongs to. The `AccessScopeManager` then displays all of these as separate rows in the dropdown and chips, causing duplicates.

### Fix

In `src/components/admin/AccessScopeManager.tsx`, deduplicate departments by `department_id` in three places:

1. **`filteredDepartments`** — after filtering by cascade, dedupe by `department_id` (keep first occurrence)
2. **`selectedDepartmentObjects`** — same deduplication for chip display

Both use a simple `Map` keyed by `department_id` to keep only unique entries.

### Changes

**File: `src/components/admin/AccessScopeManager.tsx`**

- **`filteredDepartments` memo (~line 338)**: After the existing cascade filter, dedupe the result by `department_id` using a Map, keeping the first match.
- **`selectedDepartmentObjects` memo (~line 373)**: Same dedup logic — filter then dedupe by `department_id`.

This ensures the department dropdown and chips each show a department name only once, regardless of how many facilities share that department.

