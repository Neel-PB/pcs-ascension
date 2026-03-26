

## Fix × (multiplication sign) rendering in HeadcountBreakdown

### Problem
The Unicode `×` character in the HeadcountBreakdown rows renders as a small colored block in some browsers/fonts, making the calculation unreadable.

### Fix
**File: `src/components/forecast/BalanceTwoPanel.tsx`** — line 129

Replace the literal `×` with a styled "x" or use `\u00D7` wrapped in a span with explicit font:

```tsx
// Current (line 129):
<span>{label}: {fteVal} FTE × {totalHc}</span>

// Fixed:
<span>{label}: {fteVal} FTE <span className="font-sans">×</span> {totalHc}</span>
```

If that still fails, fall back to the word "x":
```tsx
<span>{label}: {fteVal} FTE x {totalHc}</span>
```

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — line 129, fix multiplication sign rendering

