

## Fix: Wrong sums when "All Regions" selected in Skill Shift

### Root Cause

The API **ignores the `offset` parameter** (known issue per project notes). When a specific region is selected, total records fit within the 1000-record `take` limit, so everything works. When "All Regions" is selected, there are more than 1000 unique records — but since `offset` doesn't work, the pagination loop just re-fetches the same first 1000 records repeatedly, then deduplication collapses them back to ~1000. **Records beyond the first 1000 are never retrieved.**

### Fix

**`src/hooks/useSkillShift.ts`** — Remove the broken pagination loop entirely. Instead, make a single request with a large `take` value (e.g., 50000) to fetch all records at once. Keep the deduplication as a safety net.

```typescript
async function fetchSkillShift(filters: SkillShiftFilters): Promise<SkillShiftRecord[]> {
  const params = new URLSearchParams();
  if (filters.region) params.append('region', filters.region);
  if (filters.market) params.append('market', filters.market);
  if (filters.businessUnit) params.append('businessUnit', filters.businessUnit);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  if (filters.submarket) params.append('submarket', filters.submarket);
  if (filters.level2) params.append('level2', filters.level2);
  if (filters.pstat) params.append('pstat', filters.pstat);
  if (filters.nursingFlag) params.append('nursingFlag', filters.nursingFlag);
  params.append('take', '50000');

  const url = `${API_BASE_URL}/skill-shift?${params.toString()}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch skill-shift: ${res.status}`);

  const text = await res.text();
  if (!text) return [];

  const json = JSON.parse(text);
  let records: SkillShiftRecord[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

  // Deduplicate as safety net
  const seen = new Set<string>();
  return records.filter(r => {
    const key = `${r.market_hierarchy_key}|${r.skill_mix}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

### Scope
Single file (`src/hooks/useSkillShift.ts`), replacing the pagination loop with a single fetch.

