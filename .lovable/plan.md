

## Upgrade Mini-Chart Tour Preview to Match Real KPI Chart Modal

### Problem

The current `mini-chart` demo preview is a simple SVG sparkline with generic stats. The user wants the tour's "Trend Chart" step to show a preview that looks like the **actual KPI Chart Modal** — with a title header, current value, area chart with month labels on the X-axis, a legend, and High/Average/Low stats at the bottom — matching the real modal layout from the screenshot.

### Solution

Replace the simple `MiniChart` component in `TourDemoPreview.tsx` with a richer version that mirrors the layout of `KPIChartModal.tsx`, but rendered as a compact, self-contained preview (no Recharts, just SVG).

### Visual Layout of New Mini-Chart

```text
+------------------------------------------+
| 12M Average            Current Value     |
|                              633.5       |
|------------------------------------------|
| Chart   Table                            |
|                                          |
|  800 ─┬─────────────────────────────── |
|  600 ─┤  ═══════════════════════════   |
|  400 ─┤         (shaded area)           |
|  200 ─┤                                 |
|    0 ─┴─┬──┬──┬──┬──┬──┬──┬──┬──┬──┬─ |
|        Mar Apr May Jun Jul Aug Sep ...   |
|              -o- 12M Average             |
|------------------------------------------|
|  High      Average      Low             |
|  634.0     599.2        565.0            |
+------------------------------------------+
```

### Changes

**`src/components/tour/TourDemoPreview.tsx`**

Replace the `MiniChart` component with a new version that includes:

1. **Header row**: Title "12M Average" on the left, "Current Value" label + bold "633.5" on the right
2. **Tab indicators**: Two small text labels "Chart" and "Table" (Chart underlined/active)
3. **SVG area chart**: A smooth area path with blue fill gradient, plotted over a Y-axis (0, 200, 400, 600, 800) and X-axis with 12 month labels (Mar'25 through Feb'26)
4. **Legend**: A small centered "-- 12M Average" legend label below the chart
5. **Stats footer**: Three columns — High: 634.0, Average: 599.2, Low: 565.0 — separated by a top border

The data points will be realistic (hovering around 600-634 range) to match the screenshot. All rendered as inline SVG + HTML, no Recharts dependency.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Replace `MiniChart` component with a richer KPI-chart-modal-style preview |

No changes needed to `tourSteps.ts` — the step already uses `demoContent(..., 'mini-chart')`.
