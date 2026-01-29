# Access Scope Priority - IMPLEMENTED ✓

## Priority Order: Most Specific Wins

| Priority | Level | Behavior |
|----------|-------|----------|
| 1 (highest) | Department | Show ONLY assigned departments |
| 2 | Facility | Show ALL departments in assigned facilities |
| 3 | Market | Show all facilities/departments in assigned markets |
| 4 (lowest) | Region | Show all in assigned regions |

## Technical Implementation

### Files Updated:

1. **`src/hooks/useOrgScopedFilters.ts`** - `getAvailableDepartments()` now checks department FIRST
2. **`src/hooks/useForecastBalance.ts`** - `buildAccessScopeFilter()` uses name-based matching for departments
3. **`src/components/staffing/FilterBar.tsx`** - `getAvailableDepartments()` follows same priority

### Key Change: Department Name Matching

Since department IDs in `user_organization_access` may not match `positions` table, we use:
```typescript
departmentName.ilike.%${deptName}%
```

## Expected Results

| User | Assignment | Dropdown Shows | Data Displayed |
|------|------------|----------------|----------------|
| Demo Manager | Facility 52005 + Dept ICU | Only "ICU" | Departments containing "ICU" |
| Demo Director | Markets INDIANA, ILLINOIS, FLORIDA | All in those markets | All market data |
| Admin | None | All | All data |
