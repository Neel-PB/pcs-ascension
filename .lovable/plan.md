

## Center the Chart/Table Toggle in KPI Modal Header

### Change

**File: `src/components/staffing/KPIChartModal.tsx`** (lines 154-193)

Restructure the header into 3 columns so the toggle sits in the center:

- Left: Title
- Center: Chart/Table `ToggleButtonGroup` (absolutely centered)
- Right: Current Value + Trend

```text
┌─────────────────────────────────────────────┐
│ Hired FTEs     [Chart | Table]    Current   │
│                                   12,896.7  │
└─────────────────────────────────────────────┘
```

Implementation: Change `DialogHeader` to `relative` positioning, pull the toggle into an absolutely centered div (`absolute left-1/2 -translate-x-1/2`), keep title on the left and value on the right with `justify-between`.

