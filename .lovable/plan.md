

## Fix HeadcountBreakdown Display Format

### Problem
Current display shows `Full Time: 129 HC = 128.8 FTE` which loses the per-entry FTE value context. The user wants to see the calculation clearly: `FTE_value × HC = total`.

For example, `[{"fte_value":0.2, "hc":1, "employee_type":"prn"}]` should show:
```
PRN: 0.2 FTE × 1 = 0.2
```

### Fix

**File: `src/components/forecast/BalanceTwoPanel.tsx`** — `HeadcountBreakdown` component (lines 99-126)

Keep the aggregation by employee_type but change the display format to show the original FTE value and headcount with the multiplication:

```tsx
function HeadcountBreakdown({ entries }: { entries: FteHeadcountEntry[] }) {
  if (entries.length === 0) return null;

  const aggregated = new Map<string, { fteVal: number; totalHc: number; totalFte: number }>();
  for (const entry of entries) {
    const type = String(entry.employee_type).toUpperCase();
    const fteVal = parseFloat(String(entry.fte_value)) || 0;
    const hc = parseFloat(String(entry.hc)) || 0;
    const existing = aggregated.get(type);
    if (existing) {
      existing.totalHc += hc;
      existing.totalFte += fteVal * hc;
    } else {
      aggregated.set(type, { fteVal, totalHc: hc, totalFte: fteVal * hc });
    }
  }

  return (
    <div className="space-y-1">
      {Array.from(aggregated).map(([type, { fteVal, totalHc, totalFte }]) => {
        const label = employeeTypeLabels[type] || type;
        return (
          <div key={type} className="...">
            <span>{label}: {fteVal} FTE × {totalHc}</span>
            <span className="font-semibold">= {totalFte.toFixed(1)} FTE</span>
          </div>
        );
      })}
    </div>
  );
}
```

This preserves the FTE value per unit (e.g., 0.2 for PRN, 1.0 for FT) while still aggregating HC across duplicate types. Display: `PRN: 0.2 FTE × 1 = 0.2 FTE`.

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — update display format in HeadcountBreakdown

