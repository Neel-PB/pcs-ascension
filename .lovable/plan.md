

# Fix Case Sensitivity Issue in Forecast Access Scope Filtering

## Problem

The Forecast tab shows "No forecast data available" even when the Demo Director selects a specific facility (St. Vincent's Southside) that they have access to. This happens because:

1. The `user_organization_access` table stores market values in uppercase (e.g., `FLORIDA`)
2. The `positions` table stores market values in title case (e.g., `Florida`)
3. The `.in()` Supabase filter is **case-sensitive**, so `'Florida'` ≠ `'FLORIDA'`
4. Even when a facility filter is applied, the market restriction is ALSO being applied, causing no results

## Data Evidence

| Table | Market Value |
|-------|--------------|
| `user_organization_access` | `FLORIDA`, `INDIANA`, `ILLINOIS` |
| `positions` | `Florida`, `Indiana`, `Illinois` |

## Root Cause

In `useForecastBalance.ts`:
```typescript
if (!hasUnrestrictedAccess && allowedMarkets.length > 0) {
  employedQuery = employedQuery.in('market', allowedMarkets);  // CASE SENSITIVE!
}
```

The query compares `'Florida'` against `['FLORIDA', ...]` - no match.

---

## Solution

Two changes needed:

### 1. Use Case-Insensitive Comparison for Access Scope Filters

Replace `.in()` with case-insensitive `.or()` filters using `ilike`:

```typescript
// Instead of:
query.in('market', ['FLORIDA', 'INDIANA'])

// Use:
query.or('market.ilike.Florida,market.ilike.Indiana')
// Or normalize to lowercase before comparison
```

### 2. Don't Apply Market/Region Restrictions When Facility is Explicitly Selected

When a user selects a specific facility, they've already narrowed down to a valid scope. Applying additional market filters is redundant and can cause mismatches:

```typescript
// Only apply market restriction when no facility filter is active
if (facilityId) {
  employedQuery = employedQuery.eq('facilityId', facilityId);
} else {
  // Apply market restrictions only when facility not selected
  if (market) {
    employedQuery = employedQuery.ilike('market', market);
  } else if (!hasUnrestrictedAccess && allowedMarkets.length > 0) {
    // Use case-insensitive comparison
  }
}
```

---

## Technical Changes

| File | Change |
|------|--------|
| `src/hooks/useForecastBalance.ts` | Fix case sensitivity issue by normalizing market values; restructure filter priority so facility selection takes precedence over market |

---

## Implementation Details

### Option A: Normalize Case (Recommended)

Normalize market values to lowercase before comparing:

```typescript
// Build case-insensitive market filter using OR with ilike
const buildMarketFilter = (markets: string[]) => {
  return markets.map(m => `market.ilike.${m}`).join(',');
};

// Apply:
if (!hasUnrestrictedAccess && allowedMarkets.length > 0 && !facilityId) {
  employedQuery = employedQuery.or(buildMarketFilter(allowedMarkets));
}
```

### Option B: Prioritize Facility Selection

When facility is selected, skip market filtering entirely since facility is more specific:

```typescript
if (facilityId) {
  employedQuery = employedQuery.eq('facilityId', facilityId);
  // DON'T apply market filter - facility is already specific enough
} else if (market) {
  employedQuery = employedQuery.ilike('market', market);
} else if (!hasUnrestrictedAccess) {
  // Apply facility restrictions first
  if (allowedFacilities.length > 0) {
    employedQuery = employedQuery.in('facilityId', allowedFacilities);
  } else if (allowedMarkets.length > 0) {
    // Use case-insensitive market filter
    employedQuery = employedQuery.or(
      allowedMarkets.map(m => `market.ilike.${m}`).join(',')
    );
  }
}
```

---

## Expected Result

| Scenario | Before | After |
|----------|--------|-------|
| Director selects "St. Vincent's Southside" | No data (case mismatch blocks query) | Shows facility data |
| Director selects "All Facilities" | No data | Shows allowed facilities data |
| Admin selects facility | Works | Works |

---

## Testing Verification

1. Login as Demo Director
2. Select "St. Vincent's Southside" facility
3. Navigate to Forecast tab
4. Verify data appears for that facility's departments

