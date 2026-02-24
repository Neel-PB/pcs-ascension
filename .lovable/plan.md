

## Fix: Fetch All Requisitions (Not Just 1,000)

### Problem
The `useRequisitions` hook does a single `.select("*")` query. Supabase caps results at 1,000 rows by default, so the "Open Positions" count is capped at 1,000 even if there are more.

The `useEmployees` hook already solves this with a count-then-batch pattern, but `useRequisitions` and `useContractors` do not.

### Solution
Apply the same batched-fetch pattern from `useEmployees` to both `useRequisitions` and `useContractors`:

1. First query with `{ count: "exact", head: true }` to get the total count
2. Then fetch all rows in pages of 1,000 using `.range()`

### Files Changed

**`src/hooks/useRequisitions.ts`**
- Replace single query with count + batched fetch (same pattern as `useEmployees`)
- Keeps existing filters and sort order

**`src/hooks/useContractors.ts`**
- Same fix applied for consistency, since contractors could also exceed 1,000

### Pattern (from useEmployees)

```text
1. buildQuery({ count: "exact", head: true })  --> get total count
2. Loop: buildQuery().range(i*1000, (i+1)*1000 - 1) --> fetch each page
3. Combine all pages into one array
```

