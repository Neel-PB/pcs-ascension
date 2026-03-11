

## Fix: Change `limit` to `take` in skill-shift pagination

### Problem
The `useSkillShift.ts` hook sends `limit=1000` but the API likely expects `take` (matching the patient-volume pattern). Since the API doesn't recognize `limit`, it returns its default page size of 50 records and the loop exits after the first batch.

### Change: `src/hooks/useSkillShift.ts`

On line 68, change `'limit'` to `'take'`:

```typescript
// Before
params.append('limit', String(PAGE_SIZE));

// After
params.append('take', String(PAGE_SIZE));
```

Single-line change. The existing pagination loop (`while` + `offset`) will then correctly fetch all pages in batches of 1,000.

