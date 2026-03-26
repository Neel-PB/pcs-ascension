

## Style Headcount Rows and Target Footer to Match Reference Design

### What stays the same
All structure, logic, and layout — Hired FTE, Open Reqs, Recommended Actions, Position to Close/Open. No functional changes.

### What changes (visual only)

#### 1. HeadcountBreakdown row colors — per employment type
**File: `src/components/forecast/BalanceTwoPanel.tsx`** — `HeadcountBreakdown`

Currently all rows use `bg-primary/10`. Update to use distinct colors per type matching the reference:
- **Full Time** → `bg-orange-500/10 text-orange-700`
- **Part Time** → `bg-emerald-500/10 text-emerald-700`
- **PRN** → `bg-primary/10 text-primary`

```tsx
const typeColors: Record<string, string> = {
  FT: 'bg-orange-500/10 text-orange-700',
  PT: 'bg-emerald-500/10 text-emerald-700',
  PRN: 'bg-primary/10 text-primary',
};
// fallback: 'bg-muted/60 text-muted-foreground'
```

Apply to each breakdown row's container `div`.

#### 2. Target footer — colored split pills
**File: `src/components/forecast/BalanceTwoPanel.tsx`** — `RightPanel` target footer (lines 223-231)

Replace the single "Target FTE" pill with a split showing per-type targets derived from `fteHeadcountJson`. If breakdown data exists, compute each type's share and show colored pills:

```
Target FTE: 128.8    [FT 70%] [PT 20%] [PRN 10%]
```

Using matching colors: orange pill for FT, green for PT, blue for PRN. If no breakdown data, keep the current single pill.

#### 3. Left panel employment type rows — same color coding
Apply the same `typeColors` map to the Left Panel's employment type display rows (lines 34-37, 57-59) so colors are consistent across both panels.

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — color map + styled rows + target split pills

