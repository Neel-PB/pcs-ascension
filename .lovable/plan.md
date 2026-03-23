

## Show All 28 X-Axis Labels Without Skipping

### Problem
Recharts auto-hides overlapping tick labels, so some dates like `02/15`, `02/17` get dropped. The user wants every single day visible. The modal is already `max-w-5xl` but the XAxis needs to be forced to show all ticks with smaller font and angled labels.

### Change

**`src/components/staffing/KPIChartModal.tsx`** — XAxis for area charts (~line 1063)

Add `interval={0}`, reduce font size, and angle the labels so all 28 fit:

```typescript
// Before
<XAxis 
  dataKey="period" 
  className="text-xs"
  tick={{ fill: "hsl(var(--muted-foreground))" }}
/>

// After
<XAxis 
  dataKey="period" 
  className="text-xs"
  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
  interval={0}
  angle={-45}
  textAnchor="end"
  height={50}
/>
```

`interval={0}` forces Recharts to render every single tick label. The `-45` angle and smaller font ensure they don't overlap across 28 data points.

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`

