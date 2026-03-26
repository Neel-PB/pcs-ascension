

## Fix: fte_headcount_json Entries Showing Empty Names and NaN Values

### Problem
The API returns `fte_headcount_json` as a **JSON string** (e.g., `"[{\"employee_type\":\"RN\",\"fte_value\":0.9,\"hc\":1}]"`) rather than a parsed array. When the code does `push(...row.fte_headcount_json)`, it spreads individual characters of the string, resulting in entries where `employee_type`, `fte_value`, and `hc` are all `undefined`.

### Fix

**File: `src/hooks/useForecastBalance.ts`** (~line 177-179)

Parse the JSON string before spreading:

```typescript
if (row.fte_headcount_json) {
  const parsed = typeof row.fte_headcount_json === 'string'
    ? JSON.parse(row.fte_headcount_json)
    : row.fte_headcount_json;
  if (Array.isArray(parsed)) {
    g.fteHeadcountJson.push(...parsed);
  }
}
```

This handles both cases — if the API returns a string or an already-parsed array.

### Files Modified
1. `src/hooks/useForecastBalance.ts` — safe-parse `fte_headcount_json`

