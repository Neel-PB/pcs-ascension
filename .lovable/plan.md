

## Fix: Left Panel Employment Type Breakdown Showing All Zeros

### Problem
The left panel shows the correct total Hired FTE (e.g. 20.7) but all three FT/PT/PRN rows show 0.0. The `empltype_split_hired_open` data is being parsed and stored, but `normalizeEmpType` in `BalanceTwoPanel.tsx` likely doesn't recognize the actual employment_type values from the API (e.g. `"F"`, `"P"`, `"Full Time"`, `"Part Time"`, or other variants).

### Fix
**File: `src/components/forecast/BalanceTwoPanel.tsx`** — `normalizeEmpType` function (line 30-37)

Expand the normalization to handle more API variants:

```tsx
function normalizeEmpType(t: string): string {
  if (!t) return '';
  const upper = t.toUpperCase().trim();
  if (upper === 'FT' || upper === 'F' || upper === 'FULL-TIME' || upper === 'FULL TIME' || upper === 'FULL_TIME' || upper.startsWith('FULL')) return 'Full-Time';
  if (upper === 'PT' || upper === 'P' || upper === 'PART-TIME' || upper === 'PART TIME' || upper === 'PART_TIME' || upper.startsWith('PART')) return 'Part-Time';
  if (upper === 'PRN' || upper === 'PD' || upper === 'PER DIEM') return 'PRN';
  return t;
}
```

Also normalize keys during merging in `useForecastBalance.ts` (line 222) so that entries with different raw employment_type strings (e.g. `"Full Time"` vs `"FT"`) are properly merged into one bucket instead of being stored as separate entries with un-matchable keys in the component:

**File: `src/hooks/useForecastBalance.ts`** — line 222

```tsx
// Before
const existing = g.empltypeSplitHiredOpen.find(e => e.employment_type === s.employment_type);

// After — normalize before comparison
const normType = normalizeEmpTypeForMerge(s.employment_type);
const existing = g.empltypeSplitHiredOpen.find(e => normalizeEmpTypeForMerge(e.employment_type) === normType);
```

Add a small normalize helper at the top of `useForecastBalance.ts`:

```tsx
function normalizeEmpTypeForMerge(t: string | null | undefined): string {
  if (!t) return '';
  const upper = t.toUpperCase().trim();
  if (upper === 'FT' || upper === 'F' || upper.includes('FULL')) return 'Full-Time';
  if (upper === 'PT' || upper === 'P' || upper.includes('PART')) return 'Part-Time';
  if (upper === 'PRN' || upper === 'PD' || upper.includes('DIEM')) return 'PRN';
  return t;
}
```

And store the normalized type in the array (line 228):
```tsx
employment_type: normType || s.employment_type,
```

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — broaden `normalizeEmpType` to handle more API variants
2. `src/hooks/useForecastBalance.ts` — normalize employment_type during merge so the component can match them

