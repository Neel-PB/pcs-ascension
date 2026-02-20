

## Make Override Vol KPI Text Size Context-Aware

### Problem

When a department is selected but no override volume exists, the KPI card displays "--" in large `text-2xl font-bold` text. This oversized dash looks awkward. Similarly, "Select Dept" also renders in that large size.

### Solution

Make the value text size dynamic in `KPICard.tsx`:
- Non-numeric placeholder values like "--" and "Select Dept" render in `text-sm` with `text-muted-foreground`
- Actual numeric values keep the default `text-2xl font-bold`

### Files to Change

| File | Change |
|------|--------|
| `src/components/staffing/KPICard.tsx` | Add conditional styling on lines 124-129: detect if value is a placeholder (non-numeric string like "--" or "Select Dept") and apply `text-sm text-muted-foreground` instead of `text-2xl font-bold` |

### Logic

```text
isPlaceholder = typeof value === 'string' && isNaN(Number(value.replace('%','')))

if isPlaceholder:
  class = "text-sm text-muted-foreground font-medium"
else:
  class = "text-2xl font-bold tracking-tight leading-none"
```

This keeps the KPICard component generic -- any KPI passing a non-numeric value will automatically get the smaller treatment.

