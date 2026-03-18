

## Improve Pie Chart Visual Quality

Looking at the screenshot, the main issues are: overlapping labels for small slices, cluttered appearance, and the 0% slices adding noise.

### Changes — `src/components/staffing/KPIChartModal.tsx`

1. **Filter out zero-value slices** before rendering — removes "Practice Specialist 0%", "Ops Coordinator 0%" clutter

2. **Hide outer labels for slices < 3%** — only show label text for significant slices; tiny ones are still visible in the legend and tooltip

3. **Better color palette** — use more distinct, vibrant colors (currently some are too similar)

4. **Increase chart height** from 300px to 360px to give labels more room

5. **Custom label rendering** — position labels with better offset to avoid overlap; use a custom `renderLabel` function that returns null for tiny slices

6. **Legend layout** — switch to a horizontal wrap layout below the chart with colored dots, more compact than the current single-row approach

7. **Center label in donut hole** — show the total FTE value centered inside the donut ring for quick reference

### Single file change
`src/components/staffing/KPIChartModal.tsx` — pie chart rendering section (~lines 170-210)

