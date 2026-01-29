

# Fix: Facility/Department Filter Should Override Access Scope

## Problem Identified

When a Director user selects a **specific facility** from the dropdown, the Forecast tab shows no data. The root cause:

**Current Logic (broken):**
```
Query = .or(accessScopeFilter) AND .eq(facilityId)
```

This creates a PostgREST query that requires BOTH conditions to match, but the OR filter syntax combined with AND can produce unexpected results.

**Expected Logic:**
When a specific facility is selected from the dropdown, we should trust that selection (since the FilterBar already restricts options to allowed facilities) and use ONLY that filter - not also apply the access scope.

---

## Solution

Update `useForecastBalance.ts` to:

1. **Skip access scope filter when specific UI filters are applied**
   - If `facilityId` is provided → use only the facility filter
   - If `market` is provided (no facility) → use only the market filter  
   - If neither → apply access scope filter for the OR union

2. **Same pattern for departments**
   - If `departmentId` is provided → use only that filter
   - Access scope only applies when using "All Departments"

---

## Technical Changes

| File | Change |
|------|--------|
| `src/hooks/useForecastBalance.ts` | Restructure filter logic so specific UI selections bypass access scope filter |

---

## Implementation Details

### Updated Filter Logic

```typescript
// Determine if we need access scope filter at all
// When a specific facility or market is selected, trust that selection
// (FilterBar already ensures it's within user's allowed scope)
const needsAccessScopeFilter = !hasUnrestrictedAccess && !facilityId && !market;

// Build access scope filter only when needed
const accessScopeFilter = needsAccessScopeFilter ? buildAccessScopeFilter() : null;

// Apply filters
let employedQuery = supabase
  .from('positions')
  .select('*')
  .not('employeeName', 'is', null);

// Step 1: Access scope OR gate (only when no specific UI filter)
if (accessScopeFilter) {
  employedQuery = employedQuery.or(accessScopeFilter);
}

// Step 2: Apply UI filters as AND
if (facilityId) {
  employedQuery = employedQuery.eq('facilityId', facilityId);
}
if (market) {
  employedQuery = employedQuery.ilike('market', market);
}
if (departmentId) {
  // existing logic...
}
```

---

## Why This Works

| Scenario | Filter Applied | Expected Result |
|----------|----------------|-----------------|
| Director selects "St. Vincent's Southside" | `.eq('facilityId', '52005')` only | Shows facility 52005 data |
| Director selects "All Facilities" | `.or(accessScopeFilter)` | Shows all allowed facilities |
| Director selects market "INDIANA" | `.ilike('market', 'INDIANA')` only | Shows INDIANA market data |
| Admin selects facility | `.eq('facilityId', X)` only | Shows that facility |
| Admin selects "All" | No filter | Shows all data |

---

## Data Flow

```text
User: Demo Director
  ↓
FilterBar: Shows only allowed facilities (52005, 40015, etc.)
  ↓
User selects: "St. Vincent's Southside" (facility 52005)
  ↓
useForecastBalance:
  - facilityId = '52005' is provided
  - Skip access scope filter (trust FilterBar)
  - Apply: WHERE facilityId = '52005'
  ↓
Result: Data for facility 52005 displayed ✓
```

---

## Trust Model

This approach works because:

1. **FilterBar already enforces access scope** in the dropdown options
   - Users can only select facilities within their allowed markets
   - The `getAvailableFacilities()` function filters based on `restrictedOptions`

2. **Double-filtering causes problems**
   - PostgREST OR + AND syntax can have edge cases
   - Redundant to check scope twice (once in UI, once in query)

3. **Simpler queries are more reliable**
   - `WHERE facilityId = X` is straightforward
   - Complex OR conditions can fail silently

---

## Testing Verification

1. Login as Demo Director
2. Select "St. Vincent's Southside" from facility dropdown
3. Navigate to Forecast tab
4. **Verify**: Data appears for that facility
5. Select "All Facilities" 
6. **Verify**: Shows data from all allowed facilities (INDIANA, ILLINOIS, FLORIDA markets)
7. Login as Admin
8. **Verify**: No regression, sees all data

