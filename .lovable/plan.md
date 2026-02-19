

## Fix: Tour Not Starting After Cross-Page Navigation

### Root Cause

When StaffingTour finishes its last tab (NP Settings), it navigates to `/positions?tab=employees&tour=true`. But `PositionsPage.tsx` has a `useEffect` on mount (line 46-48) that immediately clears ALL search params:

```typescript
useEffect(() => {
  if (tabParam) setSearchParams({}, { replace: true });  // Wipes tour=true too!
}, []);
```

This runs before the `useTour` hook's `useEffect` can read `?tour=true`, so the tour never triggers. The same issue exists in `StaffingSummary.tsx` (line 32-36).

### Fix

In both pages, only remove the `tab` param while preserving `tour`:

**`src/pages/positions/PositionsPage.tsx`** (line 46-48):
```typescript
useEffect(() => {
  if (tabParam) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('tab');
      return next;
    }, { replace: true });
  }
}, []);
```

**`src/pages/staffing/StaffingSummary.tsx`** (line 32-36):
Same change -- selectively delete `tab` instead of replacing all params with empty.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/positions/PositionsPage.tsx` | Only delete `tab` param, preserve `tour` |
| `src/pages/staffing/StaffingSummary.tsx` | Only delete `tab` param, preserve `tour` |

