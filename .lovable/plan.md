

## Change 3M Low Highlight Dots from Red to Orange

### Change

**`src/components/staffing/KPIChartModal.tsx`** — Line 1098

Change the color for `lowest-3` from `hsl(var(--destructive))` (red) to an orange color:

```typescript
// Before
const color = highlightPoints === 'lowest-3' ? 'hsl(var(--destructive))' : 'hsl(142 71% 45%)';

// After
const color = highlightPoints === 'lowest-3' ? 'hsl(25 95% 53%)' : 'hsl(142 71% 45%)';
```

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`

