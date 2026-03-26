

## Fix Left Panel Headers to Match Reference Design

### Changes

**File: `src/components/forecast/BalanceTwoPanel.tsx`** (lines 162-165 and 175-178)

Two fixes:

1. **Inline headers** — Change from stacked (label above, value below) to inline (label then value on same line):

```tsx
// Current (stacked)
<span className="text-xs text-muted-foreground">Hired FTE</span>
<div className="text-lg font-bold">{hiredFTE.total.toFixed(1)}</div>

// Updated (inline)
<div className="flex items-baseline gap-2">
  <span className="text-xs text-muted-foreground">Hired FTE</span>
  <span className="text-lg font-bold">{hiredFTE.total.toFixed(1)}</span>
</div>
```

Same pattern for Open Reqs header.

2. **Summary section styling** — Remove the `bg-muted/60` wrapper to match the cleaner reference look. Keep it as plain text with just the border-top separator.

