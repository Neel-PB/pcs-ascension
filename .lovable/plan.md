

# Fix: Access Scope Priority - Most Specific Assignment Wins

## User Requirement Clarified

When a user has multiple levels of assignment, the **most specific** takes priority:

| Priority | Assignment Level | Behavior |
|----------|-----------------|----------|
| 1 (highest) | Department | Show ONLY assigned departments |
| 2 | Facility | Show ALL departments in assigned facilities |
| 3 | Market | Show all facilities and departments in assigned markets |
| 4 (lowest) | Region | Show all markets, facilities, and departments in assigned regions |

**Example - Demo Manager**:
- Has: Facility 52005 + Department 14452 (ICU)
- Result: Department wins → See ONLY "ICU"

---

## Current Logic (Wrong)

The current `useOrgScopedFilters.ts` gives facility priority over department (line 155-170), which is backwards.

```typescript
// WRONG: Current code checks facility FIRST
if (hasRestrictionAt('facility')) {
  // Shows all departments in facility - INCORRECT
}
// Department check comes second - INCORRECT
```

---

## Technical Changes

### File 1: `src/hooks/useOrgScopedFilters.ts`

**Change**: Reverse priority order - check department FIRST:

```typescript
const getAvailableDepartments = (): Department[] => {
  // PRIORITY 1: Department restrictions (most specific)
  if (accessScope.hasDepartmentRestriction) {
    return accessScope.departments.map(d => ({
      department_id: d.departmentId,
      department_name: d.departmentName,
      id: d.departmentId,
      facility_id: d.facilityId || '',
    }));
  }
  
  // PRIORITY 2: Facility restrictions (show all depts in those facilities)
  if (accessScope.hasFacilityRestriction) {
    // ... existing logic to get all departments in allowed facilities
  }
  
  // PRIORITY 3: Market restrictions
  if (accessScope.hasMarketRestriction) {
    // ... show departments from facilities in those markets
  }
  
  // PRIORITY 4: Region restrictions
  if (accessScope.hasRegionRestriction) {
    // ... show departments from facilities in those regions
  }
  
  return departments; // No restrictions
};
```

### File 2: `src/hooks/useForecastBalance.ts`

**Change**: Same priority order in `buildAccessScopeFilter`:

```typescript
const buildAccessScopeFilter = (): string | null => {
  if (hasUnrestrictedAccess) return null;
  
  const conditions: string[] = [];
  
  // PRIORITY 1: Department restrictions (most specific) - use name matching
  if (allowedDepartmentNames.length > 0) {
    for (const deptName of allowedDepartmentNames) {
      conditions.push(`departmentName.ilike.%${deptName}%`);
    }
    // STOP HERE - don't add facility/market conditions
    return conditions.join(',');
  }
  
  // PRIORITY 2: Facility restrictions
  if (allowedFacilities.length > 0) {
    conditions.push(`facilityId.in.(${allowedFacilities.join(',')})`);
    return conditions.join(',');
  }
  
  // PRIORITY 3: Market restrictions
  if (allowedMarkets.length > 0) {
    for (const m of allowedMarkets) {
      conditions.push(`market.ilike.${m}`);
    }
    return conditions.join(',');
  }
  
  // PRIORITY 4: Region restrictions
  if (facilityIdsInAllowedRegions.length > 0) {
    conditions.push(`facilityId.in.(${facilityIdsInAllowedRegions.join(',')})`);
    return conditions.join(',');
  }
  
  return null; // Unrestricted
};
```

**Key change**: Use **department NAME matching** (`departmentName.ilike.%ICU%`) instead of ID matching, since the assigned department ID (14452) doesn't exist in positions data.

### File 3: `src/components/staffing/FilterBar.tsx`

**Change**: Same priority order for `getAvailableDepartments()`:

Lines 147-202 need to be reordered to check department FIRST.

---

## Priority Logic Summary

| User Has | FilterBar Shows | Query Filter |
|----------|-----------------|--------------|
| Department 14452 (ICU) | Only "ICU" | `departmentName.ilike.%ICU%` |
| Facility 52005 only | All 11 departments in 52005 | `facilityId.in.(52005)` |
| Market "INDIANA" only | All facilities + departments in Indiana | `market.ilike.INDIANA` |
| Region "Midwest" only | All in Midwest | `facilityId.in.([facilities in Midwest])` |

---

## Data Flow After Fix

```text
User: Demo Manager
├── Has: Facility 52005 + Department "ICU"
├── Priority: Department wins (most specific)
│
FilterBar:
├── Facility: Shows 52005 (locked)
├── Department: Shows ONLY "ICU"
│
useForecastBalance:
├── Access Filter: departmentName.ilike.%ICU%
├── Matches: "Neonatal ICU Unit 001" (contains "ICU")
│
Result: Data for ICU-related departments ✓
```

---

## Expected Results

| User | Assigned | Dropdown Shows | Data Displayed |
|------|----------|----------------|----------------|
| Demo Manager | Facility 52005 + Dept ICU | Only "ICU" | Departments containing "ICU" |
| Demo Director | Markets INDIANA, ILLINOIS, FLORIDA | All facilities/depts in those markets | All data in those markets |
| Admin | None | All | All data |

---

## Testing Verification

1. **Demo Manager**:
   - Department dropdown: Shows ONLY "ICU" (not all 11 departments)
   - Forecast: Shows data for departments matching "ICU"

2. **Demo Director**:
   - Market dropdown: Shows allowed markets
   - Facility dropdown: Shows all facilities in allowed markets
   - Department dropdown: Shows all departments in allowed facilities
   - Forecast: Shows all data from allowed markets

3. **Admin**:
   - No restrictions - sees everything

