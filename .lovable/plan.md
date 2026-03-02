

## Wire Filters to NestJS API

### What Changes

Only one file needs to be modified: `src/hooks/useFilterData.ts`

### Current State
The `useFilterData` hook currently makes 4 parallel Supabase queries (regions, markets, facilities, departments). We need to replace this with a single `fetch` call to your NestJS API.

### Implementation

**File: `src/hooks/useFilterData.ts`**

- Remove the `supabase` import
- Replace the `queryFn` to call `GET ${VITE_API_BASE_URL}/filters/unique`
- Include the MSAL access token in the `Authorization` header (from `sessionStorage`)
- Map the API response to the existing `FilterDataResult` shape (`regions`, `markets`, `facilities`, `departments`)
- All helper functions (`getMarketsByRegion`, `getFacilitiesByMarket`, etc.) stay exactly the same since they operate on the same data shape

### Expected API Response Format

Your `GET /filters/unique` endpoint should return JSON matching this structure:

```json
{
  "regions": [
    { "id": "uuid", "region": "Florida" }
  ],
  "markets": [
    { "id": "uuid", "market": "Austin", "region": "Texas" }
  ],
  "facilities": [
    { "id": "uuid", "facility_id": "FAC001", "facility_name": "Hospital A", "market": "Austin", "region": "Texas", "submarket": "North" }
  ],
  "departments": [
    { "id": "uuid", "department_id": "DEP001", "department_name": "ICU", "facility_id": "FAC001" }
  ]
}
```

If your API uses different field names, I'll add a mapping layer to transform them.

### Technical Details

- The `VITE_API_BASE_URL` env var (already used in AuthContext) will be reused
- Auth token sent via `Authorization: Bearer <token>` header using the stored MSAL access token
- Error handling: throws on non-OK responses so React Query can retry
- All downstream components (FilterBar, CombinedOptionalFilters, OrgScopedFilters) remain unchanged -- they consume the same hook return shape
- Query key updated to remove Supabase session dependency, uses MSAL auth state instead

### Files Modified
- `src/hooks/useFilterData.ts` -- replace Supabase queries with NestJS API fetch

### No Other Changes Needed
The FilterBar, filter store, cascading logic, and all consumers remain untouched since the hook's return type stays identical.

