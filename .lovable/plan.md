

## Fix: Positions API Not Called for Demo Users

### Problem
The `/positions` API is never called because `usePositionsByFlag` requires `msal_access_token` in sessionStorage (`enabled: !!token`), but demo login uses Supabase email/password auth which never sets that token. The `/filters/unique` call works because `useFilterData` uses `enabled: !!API_BASE_URL` instead.

### Solution
Align `usePositionsByFlag` with the same auth pattern as `useFilterData`:
- Make the token optional in the Authorization header (send it if available, skip if not)
- Change the `enabled` condition to `!!API_BASE_URL` instead of `!!token`

### Change

**File: `src/hooks/usePositionsByFlag.ts`**

1. Change `enabled: !!token` to `enabled: !!API_BASE_URL` so the query runs even without an MSAL token
2. Conditionally add the Authorization header only when a token exists (matching `useFilterData` pattern)

```text
// Before
const res = await fetch(`${API_BASE_URL}/positions?${params}`, {
  headers: { Authorization: `Bearer ${token}` },
});

// After
const headers: Record<string, string> = {};
if (token) headers["Authorization"] = `Bearer ${token}`;

const res = await fetch(`${API_BASE_URL}/positions?${params}`, { headers });
```

And change `enabled: !!token` to `enabled: !!API_BASE_URL`.

This is a single-file, ~4-line change that makes the positions hook consistent with the filters hook.

