
Goal
- Make “Forecasts” show data for Director users consistently, while still enforcing access restrictions correctly (region/market/facility/department), even when the user has multiple different assignments.

What’s likely happening now (why Director sees “No forecast data”)
- The Access Scope model is flat and additive: a user can be assigned to Markets and also to Facilities (and/or Departments).
- The current Forecast query logic effectively treats “Facility restrictions” as overriding “Market restrictions” (and other levels).
- If any of the assigned Facility IDs don’t match how facility IDs appear in the positions dataset (or that facility simply has no forecast-eligible rows), the query can end up returning 0 rows, even though the user does have access via Market assignments that would have matched real data.

High-level fix
1) Enforce Access Scope as a UNION (OR) across levels, not a precedence/override chain.
   - A user should see data that matches ANY of their assigned Regions OR Markets OR Facilities OR Departments.
2) Keep UI selections as an additional narrowing filter (AND).
   - Example: If a user chooses a specific department from the dropdown, it should narrow down within what they’re allowed to see.
3) Make the filter dropdowns reflect the same reality (optional but recommended).
   - If the user is restricted to Markets, don’t show Facilities from other markets when “All Markets” is selected.

Implementation plan (code changes)
A) Fix Access Scope enforcement in Forecast query (core bug)
- File: src/hooks/useForecastBalance.ts

1. Build a single “allowed access” predicate for positions
   - Gather allowed sets from access scope:
     - allowedFacilities (ids)
     - allowedMarkets (strings)
     - allowedDepartments (ids)
     - allowedRegions (strings)
   - Convert region restrictions into a facilityId list:
     - We already fetch facilities at the start of the query. Expand that fetch to include market + region + facility_id.
     - Build facilityIdsInAllowedRegions = facilities.filter(f => allowedRegions includes f.region).map(f => f.facility_id)

2. Create a helper to build a PostgREST OR filter string
   - Example structure (conceptual):
     - facilityId.in.(…)
     - departmentId.in.(…)
     - market.ilike.MARKET1, market.ilike.MARKET2, …
     - facilityId.in.(facilityIdsInAllowedRegions…)
   - Combine into one OR string (comma-separated conditions) and apply:
     - employedQuery = employedQuery.or(accessOrString)
     - openReqsQuery = openReqsQuery.or(accessOrString)
   - Only do this when the user is restricted (not unrestricted) and there is at least one allowed condition.

3. Apply UI-selected filters as AND on top (narrowing)
   - Keep existing UI filter behavior:
     - If facility is selected: eq('facilityId', facilityId)
     - If market is selected: ilike('market', market)
     - If department is selected:
       - numeric: eq('departmentId', departmentId)
       - text: ilike('departmentName', departmentId) (current behavior)
   - Important: do NOT use “fallback restrictions” by precedence anymore (facility > market > region). The access scope should be applied once as a union OR gate.

4. Remove/adjust the post-fetch region filtering in loops
   - Today the loop filters by region using regionLookup and allowedRegions.
   - Once region restrictions are enforced via facilityIdsInAllowedRegions at query-time, we should either:
     - remove the loop-level region restriction for access scope (to avoid double-filtering and weird mismatches), or
     - keep it only for the explicit UI “Region” selection (if that filter exists in the UI).
   - This reduces the chance of accidentally filtering everything out because of a lookup mismatch.

B) Make Director dropdown options consistent (so they don’t see “all facilities” when they shouldn’t)
- File: src/components/staffing/FilterBar.tsx

1. Facility dropdown should respect market restrictions even when selectedMarket = “all-markets”
   - Current behavior: if no facility restriction and market is “all-markets”, it shows all facilities.
   - Update:
     - If user has market restrictions and selectedMarket is “all-markets”:
       - show facilities whose market is in the user’s allowed markets (case-insensitive compare).

2. Department dropdown should similarly be reduced when no facility is selected
   - When showing “unique department names”, compute from only the departments that belong to facilities within the user’s allowed markets (or allowed facilities).

This step doesn’t fix the “no forecast” bug by itself, but it prevents confusing UI states and ensures what the user can pick aligns with what the backend will return.

Verification checklist (end-to-end)
1. Log in as Demo Director.
2. Go to Staffing → Forecasts.
3. With All Facilities / All Departments:
   - Confirm forecast rows appear (should show any data allowed by the user’s markets/facilities/departments).
4. Pick a Market that the Director should see:
   - Confirm results narrow appropriately.
5. Pick a Facility:
   - Confirm results narrow further and still show data if that facility has eligible rows.
6. Pick a Department (with and without facility selected):
   - Confirm results appear (and don’t disappear due to ID/name mismatch).
7. Confirm an Admin still sees everything (no regression).

Notes / edge cases we’ll handle
- If a user has both Market and Facility assignments, access is additive (OR), not restrictive (AND).
- Case differences in market names (FLORIDA vs Florida) will remain safe because we will use ilike conditions.
- If Region restrictions exist, we’ll translate them into facility IDs using the facilities reference list, since positions rows don’t have a region field.

Expected outcome
- Director users will consistently see forecast data when there is data available in any of their assigned scope.
- UI and data will be aligned: “All Facilities” won’t accidentally mean “All in the database”; it will mean “All you’re allowed to see.”
