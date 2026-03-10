

## Fix: Unwrap paginated API response

### Problem
The API returns `{ data: [...], total: 1 }` but `useVolumeOverrides` on line 76 does:
```typescript
const data: ApiVolumeOverride[] = await res.json();
```
This assigns the entire `{ data, total }` wrapper to what it expects to be an array, so `.map(mapApiToFrontend)` fails silently or returns nothing.

### Fix
**File: `src/hooks/useVolumeOverrides.ts`** — line 76-77

Change from:
```typescript
const data: ApiVolumeOverride[] = await res.json();
return data.map(mapApiToFrontend);
```

To:
```typescript
const json = await res.json();
const items: ApiVolumeOverride[] = Array.isArray(json) ? json : (json.data || []);
return items.map(mapApiToFrontend);
```

This handles both plain array responses and paginated `{ data, total }` wrappers.

### Scope
Single file, 2-line change. No other files affected.

