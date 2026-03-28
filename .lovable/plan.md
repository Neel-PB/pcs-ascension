

## Redesign Left Panel: Unified Row Layout with Progress Bars

### New Layout

```text
┌──────────────────────────────────────────────────────┐
│            Hired FTE 18.9       Open Reqs 1.2        │
│──────────────────────────────────────────────────────│
│  Full Time  ████████████ 18.9   ██░░░░░░░░░ 0.0     │
│  Part Time  ███░░░░░░░░░  1.2   ░░░░░░░░░░░ 0.0     │
│  PRN        █░░░░░░░░░░░  0.6   ░░░░░░░░░░░ 0.0     │
│──────────────────────────────────────────────────────│
│  Summary: ...                                        │
└──────────────────────────────────────────────────────┘
```

- "Hired FTE" and "Open Reqs" headers align directly above their respective progress bar columns — no repeated sub-headers
- Each employment type row: `[Label] [Hired bar + value] [Open Reqs bar + value]`
- Bar width proportional to value relative to max value across all types and both columns
- Colors: orange (FT), emerald (PT), primary blue (PRN)

### Technical Details

**File: `src/components/forecast/BalanceTwoPanel.tsx`** — `LeftPanel` component

1. Replace `grid grid-cols-2` with a 3-column grid: `[type label ~80px] [hired bar+value] [open reqs bar+value]`
2. Header row spans the same 3 columns, with "Hired FTE X.X" over column 2 and "Open Reqs X.X" over column 3
3. Three data rows (Full-Time, Part-Time, PRN) each with:
   - Type label (left)
   - Hired: colored `div` bar (width = `value/maxValue * 100%`, height 6px) + numeric value
   - Open Reqs: same bar style + numeric value
4. Summary section remains unchanged at bottom

