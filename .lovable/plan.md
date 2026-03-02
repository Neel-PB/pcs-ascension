

## Fix: Excessive API Retry Calls

### Root Cause
All API calls to the NestJS backend (`127.0.0.1:8080`) are failing because the local server isn't reachable from the preview. React Query's default settings cause excessive retries:
- **3 automatic retries per failure** (default)
- **Refetch on window focus** (default) -- every time you switch between DevTools and the browser, all failed queries fire again
- **Multiple components mounting** `useFilterData`, each triggering its own retry cycle

### Solution
Add sensible retry and refetch settings to both hooks to prevent the request storm.

### Changes

**File 1: `src/hooks/usePositionsByFlag.ts`**
Add `retry`, `refetchOnWindowFocus`, and `staleTime` options to the `useQuery` call:

```typescript
enabled: !!API_BASE_URL,
retry: 1,
refetchOnWindowFocus: false,
staleTime: 5 * 60 * 1000,
```

**File 2: `src/hooks/useFilterData.ts`**
Add `retry` and `refetchOnWindowFocus` options (it already has `staleTime`):

```typescript
staleTime: 10 * 60 * 1000,
enabled: !!API_BASE_URL,
retry: 1,
refetchOnWindowFocus: false,
```

### Effect
- Failed requests retry only once instead of 3 times
- Switching between DevTools and the app no longer triggers refetches
- Successfully cached data stays fresh for 5-10 minutes without re-fetching

