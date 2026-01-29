
# Fix: Hierarchical Access Scope with Facility → Department Inheritance

## Problem Summary

Two issues preventing filters and forecast from working:

1. **Demo Director** - Market case mismatch ("FLORIDA" vs "Florida") causes `.in()` filter to fail
2. **Demo Manager** - Assigned department ID (14452) doesn't exist in `positions` table for their facility

**User's Requirement**: When a user is assigned to a **facility**, they should see ALL departments within that facility (not just specific department assignments).

---

## Current Access Scope Logic (Broken)

```text
Demo Manager:
├── Assigned: Facility 52005
├── Assigned: Department 14452 (ICU)
│
Current Filter Logic:
├── departmentId.in.(14452)  ← FAILS because 14452 not in positions
└── Result: No data
```

---

## Proposed Solution: Hierarchical Inheritance

### Logic Change

```text
Demo Manager:
├── Assigned: Facility 52005 (has departments: 22700, 10277, 14450, ...)
├── Assigned: Department 14452 (ignored since facility covers broader access)
│
New Filter Logic:
├── facilityId = 52005  ← Uses facility assignment
├── Department dropdown: Shows all 11 departments in facility 52005
└── Result: Data appears ✓
```

### Access Hierarchy Rules

| Assignment | Behavior |
|------------|----------|
| **Facility only** | User sees ALL departments in that facility |
| **Department only** | User sees ONLY that department |
| **Both Facility + Department** | Facility "wins" - user sees all departments in facility |
| **Market only** | User sees all facilities in market, and all their departments |

---

## Technical Changes

### File 1: `src/hooks/useOrgScopedFilters.ts`

**Change**: When determining available departments, inherit from facility assignments:

```typescript
// If user has facility restrictions, they can see ALL departments in those facilities
if (accessScope.hasFacilityRestriction) {
  // Get all departments from positions for allowed facilities
  // Instead of checking department restrictions separately
}
```

### File 2: `src/hooks/useForecastBalance.ts`

**Change**: Restructure access scope filter to prioritize facility-level access:

```typescript
// Build access scope filter with inheritance
// If user has facility access, use facilityId.in.(...)
// Department restrictions only apply if NO facility restrictions exist

const buildAccessScopeFilter = (): string | null => {
  if (hasUnrestrictedAccess) return null;
  
  const conditions: string[] = [];
  
  // 1. Facility restrictions take precedence (grants access to all depts)
  if (allowedFacilities.length > 0) {
    conditions.push(`facilityId.in.(${allowedFacilities.join(',')})`);
  }
  
  // 2. Market restrictions (case-insensitive)
  if (allowedMarkets.length > 0) {
    for (const m of allowedMarkets) {
      conditions.push(`market.ilike.${m}`);
    }
  }
  
  // 3. Region restrictions (as facility IDs)
  if (facilityIdsInAllowedRegions.length > 0) {
    conditions.push(`facilityId.in.(${facilityIdsInAllowedRegions.join(',')})`);
  }
  
  // 4. Department restrictions ONLY if no facility restrictions
  // (facility access implies access to all departments)
  if (allowedDepartments.length > 0 && allowedFacilities.length === 0) {
    conditions.push(`departmentId.in.(${allowedDepartments.join(',')})`);
  }
  
  return conditions.length > 0 ? conditions.join(',') : null;
};
```

### File 3: `src/components/staffing/FilterBar.tsx`

**Change**: Department dropdown should show departments from user's allowed facilities:

```typescript
const getAvailableDepartments = () => {
  // If user has department restrictions AND no facility restrictions
  if (hasRestrictionAt('department') && !hasRestrictionAt('facility')) {
    return restrictedOptions.availableDepartments;
  }
  
  // If user has facility restrictions, show ALL departments in those facilities
  if (hasRestrictionAt('facility')) {
    // Filter allDepartments to only those in allowed facilities
    const allowedFacilityIds = new Set(
      restrictedOptions.availableFacilities.map(f => f.facility_id)
    );
    const deptsByFacility = allDepartments.filter(d => 
      allowedFacilityIds.has(d.facility_id)
    );
    // Return unique department names
    const names = new Set<string>();
    deptsByFacility.forEach(d => names.add(d.department_name));
    return Array.from(names).sort().map(name => ({
      department_id: name,
      department_name: name,
    }));
  }
  
  // ... rest of existing logic
};
```

---

## Data Flow After Fix

```text
User: Demo Manager
├── Assigned: Facility 52005
│
FilterBar:
├── Facility dropdown: Shows "St. Vincent's Southside" (52005)
├── Department dropdown: Shows ALL 11 departments in 52005
│   └── Critical Care Unit 001, Neonatal ICU Unit 001, etc.
│
useForecastBalance:
├── Access Scope Filter: facilityId.in.(52005)
├── (Department filter NOT applied since facility grants full access)
│
Result: Data appears for all departments in facility 52005 ✓
```

---

## Expected Results

| User | Current | After Fix |
|------|---------|-----------|
| Demo Director | No data (market case mismatch) | ✓ Sees all 4 facilities and their departments |
| Demo Manager | No data (dept 14452 not found) | ✓ Sees all 11 departments in facility 52005 |
| Admin | ✓ All data | ✓ All data (no change) |

---

## Testing Verification

1. **Demo Director**:
   - Select "All Facilities" → see data from all 4 allowed facilities
   - Select "St. Vincent's Southside" → see data for that facility
   - Department dropdown shows departments from allowed facilities

2. **Demo Manager**:
   - Facility dropdown shows "St. Vincent's Southside"
   - Department dropdown shows ALL 11 departments in that facility
   - Select any department → forecast data appears

3. **Admin**:
   - No regression - sees all data with no restrictions
