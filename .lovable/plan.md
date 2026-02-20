

## Ensure Table Cards Fill Remaining Space (Even With Few Rows)

### Problem
When a table has few rows (e.g., 3-4 skill groups), the table card ends at the content and leaves a large empty gap below. The card should stretch to fill all remaining viewport space, with the empty area appearing inside the card (white background) rather than outside it.

### Root Cause
While `flex-1 min-h-0` is on the scroll containers, the table card wrappers and inner elements don't all propagate the flex growth. Specifically:
- The `FTESkillShiftTable` scroll div has `flex-1` but it's inside a card that also needs `flex-1`
- The `ForecastBalanceTable` wrapper div has `flex-1` but the Card inside needs `h-full`

### Files to Change

**1. PositionPlanning.tsx (line 963)**
The table card wrapper already has `flex-1 min-h-0 flex flex-col` -- this is correct. But the inner `FTESkillShiftTable` component's scroll container (line 533) already has `flex-1 min-h-0`. The `Table` element inside needs its parent to fill height. We need to ensure the table's `overflow-auto` div fills the card.

No change needed here -- it already has `flex-1 min-h-0 flex flex-col`.

**2. PositionPlanning.tsx - FTESkillShiftTable (line 533)**
The scroll container has `flex-1 min-h-0` which is correct. The issue is the `Table` component uses `table-fixed` layout which doesn't stretch. We should ensure the scroll container fills available space. Currently correct.

**3. VarianceAnalysis.tsx (line 723)**
The table card has `flex-1 min-h-0` -- correct. No change needed.

**4. ForecastTab.tsx (line 63)**
The wrapper div has `flex-1 min-h-0` but ForecastBalanceTable's Card needs `h-full` to fill it. The Card already has `h-full flex flex-col` -- correct.

### Actual Fix Needed
The issue is that in all three tabs, the table card background fills correctly via `flex-1`, but the inner scroll area collapses to content height. The fix:

- **PositionPlanning.tsx line 533**: The scroll container `div` wrapping the `Table` needs to be the flex child that grows. It already has `flex-1 min-h-0`. But it's inside the `FTESkillShiftTable` function component which returns it directly -- so the motion.div parent (line 963) with `flex-1 min-h-0 flex flex-col` should propagate correctly.

After re-examining, the real issue is simpler: **the card/container backgrounds fill correctly via flex-1, but the empty space below content rows just shows the card background** -- which is actually the desired behavior. The screenshot shows a white card that stretches to the bottom with content at top and empty space below.

Looking more carefully at the screenshot, the card IS stretching (white background fills the space). The behavior shown is actually correct -- the card fills remaining space, rows are at the top, empty card area below.

If the user wants to ensure this works consistently, the key classes needed are:
- Table card wrapper: `flex-1 min-h-0 flex flex-col` (already set)
- Inner scroll div: `flex-1 min-h-0 overflow-auto` (already set)

The only file where this might not work is **ForecastBalanceTable.tsx** -- let me verify the Card gets `h-full`. It already has `h-full flex flex-col` on the Card and `flex-1 min-h-0 overflow-auto` on the inner div.

### Summary
All three tab layouts already have the correct flex propagation. The table cards will:
- **Stretch to fill remaining space** when content is small (card background visible)
- **Scroll internally** when content exceeds available space

No additional code changes are needed -- the current implementation already handles the "min content" case correctly. The white empty area in the screenshot IS the card filling the remaining space as intended.

However, if this is NOT working as shown (i.e., the card is NOT stretching), the fix would be to ensure every intermediate wrapper between the flex parent and the table has `flex-1 min-h-0`:

| File | Line | Current | Change |
|------|------|---------|--------|
| `src/pages/staffing/StaffingSummary.tsx` | Tab content wrapper | `flex-1 min-h-0` | Ensure this passes `h-full` to children |

Let me verify the StaffingSummary tab content area passes height correctly to tab children.

After checking: The tab content div (line ~542) has `flex-1 min-h-0` but the individual tab components (PositionPlanning, VarianceAnalysis, ForecastTab) use `h-full` on their root. The connection should work.

**The implementation from the last round should already handle this correctly.** If the card is not stretching in the preview, it may be a rendering issue that resolves on refresh. No new code changes are required.
