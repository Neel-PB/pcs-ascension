

## Fix NaN in Headcount Breakdown (fte_headcount_json)

### Problem
The `fte_headcount_json` entries have `fte_value` and `hc` as strings (from API). The multiplication `entry.fte_value * entry.hc` produces NaN.

### Fix

**File: `src/components/forecast/BalanceTwoPanel.tsx`** (HeadcountBreakdown component, ~lines 96-103)

Parse the values before display:

```tsx
{entries.map((entry, i) => {
  const fteVal = parseFloat(String(entry.fte_value)) || 0;
  const hc = parseFloat(String(entry.hc)) || 0;
  return (
    <div key={i} className="flex items-center justify-between text-xs text-muted-foreground bg-primary/10 rounded px-2 py-1">
      <span>{entry.employee_type}: {fteVal} FTE × {hc}</span>
      <span>= {(fteVal * hc).toFixed(1)}</span>
    </div>
  );
})}
```

This fixes the `= NaN` display in the "Position to Open" breakdown rows.

