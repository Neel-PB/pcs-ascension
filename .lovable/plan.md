

## Restructure Left Panel: Split Hired FTE and Open Reqs into Two Columns

### Layout Change

The left panel (45%) currently stacks everything vertically. Instead, split it into two side-by-side columns internally:

```text
┌──────────── Left Panel (45%) ─────────────┐
│  Hired FTE: 12.0    │  Open Reqs: 3.0     │
│  ─────────────────  │  ─────────────────   │
│  Full-Time  █████   │  Full-Time  2.0      │
│  Part-Time  ███     │  Part-Time  0.6      │
│  PRN        █       │  PRN        0.4      │
│─────────────────────────────────────────────│
│  Summary: Based on your current...          │
└─────────────────────────────────────────────┘
```

- **Left column**: "Hired FTE" header + total, then FT/PT/PRN percentage bars (existing `PercentageBar` component)
- **Right column**: "Open Reqs" header + total, then FT/PT/PRN values listed vertically (simple label + value rows, matching style)
- **Below both columns**: AI Summary stays full-width at the bottom

### Change

**File: `src/components/forecast/BalanceTwoPanel.tsx`** (~lines 156-210)

1. Replace the current combined header row and stacked content with a `grid grid-cols-2 gap-4` inside the left panel Card
2. **Left sub-column**: "Hired FTE" label + total value, then the 3 `PercentageBar` components for FT/PT/PRN
3. **Right sub-column**: "Open Reqs" label + total value, then 3 simple rows showing FT/PT/PRN values styled consistently (label left, value right, with a subtle background like `bg-muted/60`)
4. Remove the existing separate "Open Requisitions" section with the 3 horizontal cards (lines 193-209)
5. AI Summary section remains below, spanning full width

