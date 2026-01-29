

# Apply User Access Scope to Forecast Tab

## Problem

The Demo Director user has access scope restricted to specific facilities (St. Vincent Indianapolis Hospital and Amita Health Mercy Ctr Aurora) in INDIANA and ILLINOIS markets. However, the Forecast tab shows data for ALL facilities including ones in Florida that the user should not be able to see.

The current implementation only filters by UI selections ("All Facilities" means no filter applied), but it doesn't apply the user's underlying access scope restrictions.

---

## Root Cause

The `useForecastBalance` hook:
1. Only filters by explicitly passed filter values from the UI
2. Does not query or apply the user's `user_organization_access` restrictions
3. When UI shows "All Facilities", no facility filter is applied to the database query

---

## Solution

Update `useForecastBalance` to also fetch and apply the current user's access scope restrictions. When "All Facilities" is selected in the UI but the user has facility restrictions, the query should filter to only their allowed facilities.

---

## Technical Changes

| File | Change |
|------|--------|
| `src/hooks/useForecastBalance.ts` | Add user access scope fetching and apply restrictions to both employed and open reqs queries |

---

## Implementation Details

### 1. Add Access Scope Fetching

Inside `useForecastBalance`, fetch the current user's access scope:

```typescript
import { useAuth } from "@/hooks/useAuth";

// Get current user
const { user } = useAuth();

// Fetch user's access scope
const { data: userAccessScope } = await supabase
  .from('user_organization_access')
  .select('region, market, facility_id')
  .eq('user_id', user?.id);
```

### 2. Build Access Scope Filters

Extract unique values the user has access to:

```typescript
const allowedMarkets = new Set<string>();
const allowedFacilities = new Set<string>();

userAccessScope?.forEach(row => {
  if (row.market) allowedMarkets.add(row.market);
  if (row.facility_id) allowedFacilities.add(row.facility_id);
});
```

### 3. Apply Combined Filters

When building queries, apply BOTH:
- UI filter selections (if specific value selected)
- Access scope restrictions (if no specific UI value selected and user has restrictions)

```typescript
// If UI has specific facility selected, use that
// Otherwise, if user has facility restrictions, filter to allowed facilities
if (facilityId) {
  employedQuery = employedQuery.eq('facilityId', facilityId);
} else if (allowedFacilities.size > 0) {
  employedQuery = employedQuery.in('facilityId', Array.from(allowedFacilities));
}

// Same pattern for market
if (market) {
  employedQuery = employedQuery.ilike('market', market);
} else if (allowedMarkets.size > 0) {
  employedQuery = employedQuery.in('market', Array.from(allowedMarkets));
}
```

### 4. Update Query Key

Include user ID in the query key to ensure proper cache invalidation:

```typescript
queryKey: ['forecast-balance', userId, { departmentId, region, market, facilityId, ... }]
```

---

## Expected Result

| Scenario | Before | After |
|----------|--------|-------|
| Director selects "All Facilities" | Sees ALL facilities (Florida, etc.) | Sees only allowed facilities (Indiana, Illinois) |
| Director selects specific allowed facility | Works correctly | Works correctly |
| Admin with no restrictions | Sees all data | Sees all data (unchanged) |
| KPI totals | Include unauthorized data | Reflect only authorized data |

---

## Data Flow

```text
User: Demo Director
  ↓
Access Scope: Facilities 40015, 40012 (Indiana, Illinois markets)
  ↓
UI Selection: "All Facilities"
  ↓
useForecastBalance:
  - Check UI filter: "all-facilities" → no explicit filter
  - Check access scope: has facility restrictions
  - Apply: WHERE facilityId IN ('40015', '40012')
  ↓
Result: Only authorized data displayed
```

