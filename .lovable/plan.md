

## Reorder KPI Tour Steps to Match UI Display Order

### Problem

The KPI tour steps in `tourSteps.ts` don't match the actual card order in the UI. The UI renders cards based on `useKPIOrderStore` defaults, but the tour walks through them in a different sequence.

### Current Tour Order vs Correct UI Order

**FTE Section:**

| Position | Current Tour Order | Correct UI Order |
|----------|-------------------|-----------------|
| 1 | Vacancy Rate | Vacancy Rate |
| 2 | **Hired FTEs** | **Target FTEs** |
| 3 | **Target FTEs** | **Hired FTEs** |
| 4 | FTE Variance | FTE Variance |
| 5 | Open Reqs | Open Reqs |
| 6 | Req Variance | Req Variance |

**Volume Section:** Already correct (12M Average, 12M Daily, 3M Low, 3M High, Target Vol, Override Vol)

**Productivity Section:**

| Position | Current Tour Order | Correct UI Order |
|----------|-------------------|-----------------|
| 1 | Paid FTEs | Paid FTEs |
| 2 | **Contract FTEs** | **Employed Productive FTEs** |
| 3 | **Overtime FTEs** | **Contract FTEs** |
| 4 | **Total PRN** | **Overtime FTEs** |
| 5 | **Total NP%** | **Total PRN** |
| 6 | **Employed Productive FTEs** | **Total NP%** |

### Changes

**`src/components/tour/tourSteps.ts`** -- Reorder the step objects to match the `useKPIOrderStore` default order:

1. **FTE section**: Swap the Hired FTEs step (currently at position 2) with Target FTEs step (currently at position 3) so the order becomes: Vacancy Rate, Target FTEs, Hired FTEs, FTE Variance, Open Reqs, Req Variance

2. **Productivity section**: Move the Employed Productive FTEs step from its current position (last in productivity) to position 2 (after Paid FTEs), then Contract FTEs, Overtime FTEs, Total PRN, Total NP%

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Reorder FTE KPI steps (swap Hired/Target) and Productivity KPI steps to match UI default order |
