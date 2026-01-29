
# Fix: Clear Filters Respects Access Scope + Exact Department Name Match

## Problems Identified

### Problem 1: Clear Filters Ignores Access Scope
When Demo Manager clicks "Clear Filters":
- **Current behavior**: Department set to `"all-departments"` (locked but empty label)
- **Expected behavior**: Department reset to `"ICU"` (their assigned default)

### Problem 2: Table Shows Wrong Data
When Demo Manager is assigned Department = "ICU":
- **Current behavior**: Table shows all departments containing "ICU" (Neonatal ICU, Pediatric ICU, Neuro Trauma ICU, etc.)
- **Expected behavior**: Table shows ONLY exact "ICU" department match

---

## Root Cause Analysis

### Clear Filters Issue
The `handleClearFilters()` function in `StaffingSummary.tsx` (line 125-133) blindly resets all filters to `"all-*"` values without consulting Access Scope defaults:

```typescript
const handleClearFilters = () => {
  setSelectedRegion("all-regions");
  setSelectedMarket("all-markets");
  // ...
  setSelectedDepartment("all-departments"); // WRONG for restricted users
};
```

### Table Data Issue
The `useForecastBalance.ts` hook uses partial matching (`ilike`) for department names (line 395):

```typescript
conditions.push(`departmentName.ilike.%${deptName}%`); // Matches "Neonatal ICU Unit 001"
```

Should use exact matching instead:

```typescript
conditions.push(`departmentName.eq.${deptName}`); // Matches only "ICU"
```

---

## Technical Changes

### File 1: `src/pages/staffing/StaffingSummary.tsx`

**Change**: Modify `handleClearFilters` to reset filters to Access Scope defaults, not hardcoded `"all-*"` values.

```typescript
const handleClearFilters = () => {
  // Reset to Access Scope defaults instead of "all-*"
  // For restricted filters, this respects assigned values
  // For unrestricted filters, this sets them to "all-*"
  setSelectedRegion(defaultFilters?.region ?? "all-regions");
  setSelectedMarket(defaultFilters?.market ?? "all-markets");
  setSelectedFacility(defaultFilters?.facility ?? "all-facilities");
  setSelectedSubmarket("all-submarkets"); // Optional filter - always reset
  setSelectedPstat("all-pstat"); // Optional filter - always reset
  setSelectedLevel2("all-level2"); // Optional filter - always reset
  setSelectedDepartment(defaultFilters?.department ?? "all-departments");
};
```

**Result for Demo Manager**:
- Clear Filters will set Department back to "ICU" (their assigned default)
- Facility stays at their assigned facility
- Optional filters reset to "All"

### File 2: `src/pages/positions/PositionsPage.tsx`

**Change**: Same fix for `handleClearFilters` (line 103-110).

### File 3: `src/hooks/useForecastBalance.ts`

**Change**: Replace `ilike` (partial match) with `eq` (exact match) for department names in `buildAccessScopeFilter`:

```typescript
// PRIORITY 1: Department restrictions (most specific) - use EXACT NAME matching
if (allowedDepartmentNames.length > 0) {
  for (const deptName of allowedDepartmentNames) {
    // Use exact match instead of partial match
    conditions.push(`departmentName.eq.${deptName}`);
  }
  return conditions.join(',');
}
```

---

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `src/pages/staffing/StaffingSummary.tsx` | `handleClearFilters` uses `defaultFilters` | Clear button respects Access Scope |
| `src/pages/positions/PositionsPage.tsx` | Same fix for `handleClearFilters` | Clear button respects Access Scope |
| `src/hooks/useForecastBalance.ts` | Replace `ilike.%name%` with `eq.name` | Exact department name matching |

---

## Expected Behavior After Fix

| Action | Before | After |
|--------|--------|-------|
| Demo Manager clicks Clear | Department shows "All Departments" (locked) | Department shows "ICU" (locked) |
| Demo Manager views table | Shows 15+ rows (all departments with "ICU" in name) | Shows only rows where `departmentName = "ICU"` exactly |

---

## Testing Verification

1. **Demo Manager Login**:
   - Department filter shows "ICU" (locked)
   - Table shows ONLY departments named exactly "ICU"
   - Click Clear → Filter stays at "ICU", not "All Departments"

2. **Demo Director Login**:
   - Filters reset to their market defaults
   - No department restriction → shows all departments in allowed markets

3. **Admin Login**:
   - Clear resets everything to "All" (no restrictions)
   - Table shows all data
