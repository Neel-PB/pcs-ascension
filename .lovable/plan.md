

## Fix: Duplicate records from broken API pagination in skill-shift

### Root Cause
The NestJS `/skill-shift` API ignores the `offset` query parameter. When Region-level queries return exactly 1000 records (hitting `PAGE_SIZE`), the pagination loop fetches a second page at `offset=1000` — but the API returns the same 1000 records again. This doubles all aggregated values (hired FTE, target, open reqs).

Market/Facility/Department views work correctly because they return fewer than 1000 records, so only one page is ever fetched.

**Evidence**: Network requests show `offset=0` and `offset=1000` both returning identical first records (Mother Baby Unit 001 / ANM / hired_day_fte: 1.00).

### Fix

**File: `src/hooks/useSkillShift.ts`** — Deduplicate records after the pagination loop using `market_hierarchy_key` + `skill_mix` as a composite unique key.

```typescript
// After the while loop, deduplicate by composite key
const seen = new Set<string>();
const deduped = allRecords.filter(r => {
  const key = `${r.market_hierarchy_key}|${r.skill_mix}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
return deduped;
```

**File: `src/hooks/usePatientVolume.ts`** — Apply the same deduplication preventatively using `market_hierarchy_key` + `department_id` as the unique key, since the same pagination bug will surface when patient-volume data exceeds 1000 records.

### Scope
Two small edits, one per file. No UI or component changes needed.

