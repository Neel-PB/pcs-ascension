

## Fix: Make Position Planning and Variance Analysis Tables Scrollable

### Root Cause

Both tables grow to their full content height because their parent containers have no height constraint. The `Table` component's wrapper (`div.overflow-auto`) only enables scrolling when there's a fixed or constrained height — without one, the content just expands infinitely.

### The Fix

Add a `max-h-[600px]` constraint to the scrollable container around each table, similar to how `ForecastBalanceTable` already does it (`max-h-[600px] overflow-auto`).

### Changes

**`src/pages/staffing/PositionPlanning.tsx`** (line 533):
- Change the `FTESkillShiftTable` outer div from `overflow-x-auto` to `overflow-auto max-h-[600px]`
- This constrains vertical height while preserving horizontal scroll

**`src/pages/staffing/VarianceAnalysis.tsx`** (line 723):
- Change the table container div from `overflow-hidden overflow-x-auto` to `overflow-auto max-h-[600px]`

Additionally, both tables need sticky headers so column labels remain visible while scrolling:

**`src/pages/staffing/PositionPlanning.tsx`** (FTESkillShiftTable `TableHeader`):
- Add `className="sticky top-0 z-10 bg-card"` to `TableHeader`

**`src/pages/staffing/VarianceAnalysis.tsx`** (VarianceTable `TableHeader`):
- Add `className="sticky top-0 z-10 bg-card"` to `TableHeader`

### Files Changed

| File | Change |
|------|--------|
| `src/pages/staffing/PositionPlanning.tsx` | Add `max-h-[600px]` to table container, sticky header on `TableHeader` |
| `src/pages/staffing/VarianceAnalysis.tsx` | Add `max-h-[600px]` to table container, sticky header on `TableHeader` |

