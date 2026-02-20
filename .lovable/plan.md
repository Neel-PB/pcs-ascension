

## Make Table Cards Shrink-Wrap Content (Not Force Full Height)

### Problem
Currently, the table cards stretch to fill all remaining viewport space even when they have very few rows. The user wants the card to only be as tall as its content -- short when there are few rows, and capped/scrollable when content exceeds available space.

### Solution
Replace `flex-1 min-h-0` (which forces growth) with `max-h-full overflow-auto` (which caps height but doesn't force it) on the table card wrappers. The tab content area should also stop forcing children to stretch.

### Files to Change

**1. StaffingSummary.tsx (line 542)**
- Change the tab content wrapper from `flex-1 min-h-0` to `flex-1 min-h-0 overflow-auto`
- This allows the content area to scroll if needed but doesn't force children to fill it

**2. PositionPlanning.tsx (line 965)**
- Change table card from `flex-1 min-h-0 flex flex-col` to `min-h-0 max-h-full flex flex-col`
- Card sizes to content, capped at available space

**3. VarianceAnalysis.tsx (line 723)**
- Change table wrapper from `flex-1 min-h-0` to `min-h-0 max-h-full`
- Same pattern: natural height, capped at parent

**4. ForecastTab.tsx** -- Apply the same pattern to the forecast table wrapper

### Result
- Few rows: card is short, empty space below is the page background (not card white)
- Many rows: card fills available space and scrolls internally
- No page-level scrollbar

