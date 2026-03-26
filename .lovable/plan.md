

## Restore Rich Narrative Summary in Left Panel

### Problem
The current Summary section shows a basic one-liner like "5.9 FTE surplus identified. 1.8 FTE addressed." The previous version had a detailed narrative that explained the recommendation in context — referencing the current employment mix, specific actions (open PRN, cancel reqs, close positions), priority order, and target split.

### Approach
Build a dynamic narrative summary using data already available on the `ForecastBalanceRow`:

- **Current mix %** — compute from `fteHeadcountJson` entries (same logic already used in target footer)
- **Actions** — derive from `staffingStatus`, `addressedFte`, `unaddressedFte`, `openReqsFte`, `actionTypes`
- **Target split** — use the static 70/20/10 reference (FT/PT/PRN) per existing memory
- **Skill + Shift** — from `row.skillType` and `row.shift`

The narrative template for **surplus**:
> "Based on your current mix of {FT%} FT / {PT%} PT / {PRN%} PRN, we recommend canceling {addressedFte} FTE in open requisitions, additionally closing {unaddressedFte} FTE from employed positions. We recommend first canceling open requisitions before considering any employed position changes. This will reduce the {totalFteReq} FTE surplus while achieving the optimal 70/20/10 split for your {skillType} {shift} shift workforce."

For **shortage**:
> "Based on your current mix of {FT%} FT / {PT%} PT / {PRN%} PRN, we recommend opening {totalFteReq} FTE across {breakdown}. This will address the {totalFteReq} FTE shortage while achieving the optimal 70/20/10 split for your {skillType} {shift} shift workforce."

For **balanced**:
> "Staffing is balanced for your {skillType} {shift} shift workforce."

### File Modified
1. **`src/components/forecast/BalanceTwoPanel.tsx`** — lines 73-84: replace the static summary with a function that generates the rich narrative from row data

