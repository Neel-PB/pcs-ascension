

## Root Cause: `nursingFlag` query parameter mismatch

The database has `nursing_flag` as a **boolean** (`true`/`false`), but the frontend sends `nursingFlag='Y'` or `nursingFlag='N'` (strings) to the API.

**Line 524 in `PositionPlanning.tsx`:**
```typescript
const nursingFlag = isDepartmentSelected ? undefined : (staffCategory === 'nursing' ? 'Y' : 'N');
```

When no department is selected (the screenshot's case — Region 1, Non-Nursing), this sends `nursingFlag=N` to the `/skill-shift` API. The API likely ignores this unrecognized string value and returns **all records** (both nursing and non-nursing). The frontend then aggregates everything — hence support staff shows 642.1 instead of the correct 103.60.

The `filteredSkillShiftData` memo only filters locally when `isDepartmentSelected` is true (line 556), so at region/market level, the unfiltered data flows straight through.

### Two issues to fix

1. **API query parameter** — send `'true'`/`'false'` instead of `'Y'`/`'N'` so the API can filter server-side.
2. **Client-side fallback filter** — always filter by `nursing_flag` even when no department is selected, as a safety net.

### Changes

**`src/pages/staffing/PositionPlanning.tsx` — line 524:**
```typescript
// Before:
const nursingFlag = isDepartmentSelected ? undefined : (staffCategory === 'nursing' ? 'Y' : 'N');

// After:
const nursingFlag = isDepartmentSelected ? undefined : (staffCategory === 'nursing' ? 'true' : 'false');
```

**`src/pages/staffing/PositionPlanning.tsx` — filteredSkillShiftData memo (~line 554):**
```typescript
const filteredSkillShiftData = useMemo(() => {
  if (!skillShiftData?.length) return [];
  const isNursing = staffCategory === 'nursing';
  return skillShiftData.filter(r => {
    if (typeof r.nursing_flag === 'boolean') return r.nursing_flag === isNursing;
    if (typeof r.nursing_flag === 'string') return (r.nursing_flag.toUpperCase() === 'Y') === isNursing;
    return true;
  });
}, [skillShiftData, staffCategory]);
```

This removes the `isDepartmentSelected` bypass — data is always filtered by the selected nursing category, regardless of filter level. The server-side filter with `'true'`/`'false'` handles the primary filtering; the client-side filter acts as a safety net.

### Scope
Single file, ~8 lines changed.

