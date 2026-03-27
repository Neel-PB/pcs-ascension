

## Fix: Guard `normalizeEmpType` Against Undefined Input

### Problem
`normalizeEmpType(t)` calls `t.toUpperCase()` but receives `undefined` when API rows have missing `employment_type` values, causing the crash.

### Fix
**File: `src/components/forecast/BalanceTwoPanel.tsx`** — line 29-30

Add an early return guard:

```tsx
function normalizeEmpType(t: string): string {
  if (!t) return '';
  const upper = t.toUpperCase().trim();
  ...
}
```

Also guard `getLabel` and `getColor` (lines 37-42) to handle empty/undefined input gracefully:
```tsx
function getLabel(t: string): string {
  if (!t) return 'Unknown';
  ...
}

function getColor(t: string): string {
  if (!t) return 'bg-muted/60 text-muted-foreground';
  ...
}
```

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — lines 29, 37, 41: add null guards

