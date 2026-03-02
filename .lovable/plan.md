

## Fix: API Response Parsing Mismatch

### Problem
The positions API returns data in the format `{ "count": 21067, "rows": [...] }`, but the `usePositionsByFlag` hook on line 44 looks for `batch.data`:

```
const rows = Array.isArray(batch) ? batch : batch.data ?? [];
```

Since `batch.data` is `undefined`, it falls back to an empty array `[]`, so the UI always shows "No employees found" despite the API returning 21,067 records.

### Fix
**File: `src/hooks/usePositionsByFlag.ts`** (line 44)

Change the response parsing to check for `batch.rows` (matching your API's actual response shape), with a fallback to `batch.data` for backward compatibility:

```typescript
const rows = Array.isArray(batch) ? batch : (batch.rows ?? batch.data ?? []);
```

This single-line change will correctly extract the position records from your API response.
