

## Fix: KPI Chart Modal Spacing

**Issues identified from the screenshot (12M Average modal):**

1. **Title-to-tabs divider spacing** — The `border-b` on the header and the toggle tabs below have inconsistent gaps
2. **Below tabs gap** — No breathing room between the Chart/Table toggle and the chart itself
3. **Excess space below chart** — The chart container (`h-[320px]` wrapper with `h-[280px]` chart) leaves ~40px dead space; the stats footer also has unnecessary padding

**File: `src/components/staffing/KPIChartModal.tsx`**

### Changes

1. **Line 147** — DialogContent: change `gap-0` to `gap-2` for consistent vertical rhythm between header, tabs, and chart area

2. **Line 180** — Content wrapper: change `space-y-2 pt-1` to `space-y-3 pt-0` to add proper gap below tabs while removing redundant top padding

3. **Line 802-803** — Chart tab container: change `space-y-2` to `space-y-1` and reduce the outer chart div from `h-[320px]` to `h-[300px]` to eliminate dead space below the chart for non-pie types

4. **Line 897** — Area/Line/Bar chart container: increase from `h-[280px]` to `h-[290px]` so the chart fills more of the container, reducing the gap between chart bottom and stats

5. **Lines 1001, 992, 982** — Stats footers: change `pt-1.5`/`pt-2` to `pt-2` consistently and ensure `border-t` divider has matching spacing to the header divider

6. **Line 148** — Header: change `pb-2` to `pb-3` so the title divider spacing matches what will be below the tabs

These changes tighten the vertical layout: consistent divider gaps, proper spacing below tabs, and chart fills available space without dead whitespace below it.

