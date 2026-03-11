

## Fix: Fetch all skill-shift records by requesting full dataset

### Problem
The `/skill-shift` API returns paginated data (`{ data, total }`). When no filters are applied, the total record count exceeds the API's default page size, so only a subset is returned. This causes "All Regions" to show lower totals than a single region.

### Solution
Pass `limit=10000` (or a sufficiently large number) as a query parameter to the `/skill-shift` API call so the backend returns all records in one request. This matches the pattern used by other hooks in the app.

### Change: `src/hooks/useSkillShift.ts` — `fetchSkillShift` function

Add a `limit` query parameter to the request URL to ensure the full dataset is returned:

```typescript
async function fetchSkillShift(filters: SkillShiftFilters): Promise<SkillShiftRecord[]> {
  const params = new URLSearchParams();
  params.append('limit', '10000'); // Request all records

  if (filters.region) params.append('region', filters.region);
  // ... rest unchanged
}
```

If the API uses `take` instead of `limit`, adjust accordingly. If this doesn't resolve it, we'll need to implement multi-page fetching using the `total` from the response.

### Scope
Single file, ~1 line addition in `useSkillShift.ts`.

