

## Fix: Table Tab and Stats for Dual-Pie (Vacancy Rate & Target FTEs)

### Problem
1. **Table tab** has no `dual-pie` handler — when clicking "Table", it falls through to the generic period/value table which doesn't work with the `[{ shift, slices, total }]` data shape
2. **Stats footer** still shows High/Average/Low for dual-pie because the `stats` calculation (line 113) doesn't exclude `dual-pie`

### Changes

#### `src/components/staffing/KPIChartModal.tsx`

**1. Fix stats calculation (line 113)**
Exclude `dual-pie` from stats:
```typescript
const stats = (!isPie && !isDualPie && chartData) ? { ... } : null;
```

**2. Add dual-pie handler in Table tab (after line 1107)**
Insert a new branch before the `isPie` check in the table section:

```
isDualPie && chartData → render a table with columns:
  Skill Mix | Day FTE | Day % | Night FTE | Night %
```

Each row comes from the union of slice names across both shift groups. Totals row at the bottom.

**3. Add dual-pie total footer in Table tab stats section**
Show combined Day/Night totals instead of High/Avg/Low:
```
Day Total: X  |  Night Total: Y  |  [Close]
```

### Layout
```text
Table Tab for dual-pie:
┌────────────┬──────────┬───────┬───────────┬────────┐
│ Skill Mix  │ Day FTE  │ Day % │ Night FTE │ Night% │
├────────────┼──────────┼───────┼───────────┼────────┤
│ RN         │  5.2     │ 41.6% │   3.1     │  38.8% │
│ PCT        │  2.0     │ 16.0% │   1.5     │  18.8% │
│ ...        │          │       │           │        │
└────────────┴──────────┴───────┴───────────┴────────┘
  Day Total: 12.5    Night Total: 8.0     [Close]
```

