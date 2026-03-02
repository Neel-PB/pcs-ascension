

## Fix Double Slash in Filter API URL

### Problem
`VITE_API_BASE_URL` is set to `http://127.0.0.1:8080` but the fetch URL template creates a double slash: `${API_BASE_URL}/filters/unique` becomes `http://127.0.0.1:8080//filters/unique`.

This likely means the env var has a trailing slash. The fix is to strip any trailing slash from `API_BASE_URL` before using it.

### Change

**File: `src/hooks/useFilterData.ts`** (line 37)

Replace:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

With:
```typescript
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
```

This strips any trailing slashes from the env variable, so regardless of whether the user sets `http://127.0.0.1:8080` or `http://127.0.0.1:8080/`, the URL will always be correctly formed as `http://127.0.0.1:8080/filters/unique`.

### Files Modified
- `src/hooks/useFilterData.ts` -- one-line fix to strip trailing slash from base URL

