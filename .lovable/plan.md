

## Enhance KPI Actions Wireframe with Rich Previews

### Problem

The current `kpi-actions` wireframe in the tour tooltip only shows small icons with text labels ("Trend Chart" and "Definition"). The user wants each row to include a visual preview of what clicking the button actually opens — a mini area chart for the chart icon, and a definition/formula box for the eye icon — connected by visual lines.

### What Each Row Will Show

**Chart Row (when hasChart is true):**
- Bar chart icon in a rounded box
- A connecting line/arrow
- "Trend Chart" label
- Below that: a compact version of the mini area chart (smaller than the full `mini-chart` variant — just the SVG line chart with a few data points, no stats footer)

**Definition Row:**
- Eye icon in a rounded box
- A connecting line/arrow
- "Definition" label
- Below that: a compact definition + formula preview (similar to `kpi-info` variant but smaller)

### Visual Layout

```text
+--------------------------------------------+
| [chart-icon] --- Trend Chart               |
|                  View 12-month historical   |
|                  trends and breakdowns.     |
|                  +------------------------+ |
|                  | [mini area chart SVG]  | |
|                  +------------------------+ |
|                                             |
| [eye-icon]   --- Definition                |
|                  See the formula and how    |
|                  this metric is calculated. |
|                  +------------------------+ |
|                  | Definition: ...         | |
|                  | Calculation: ...        | |
|                  +------------------------+ |
+--------------------------------------------+
```

### Technical Changes

**`src/components/tour/TourDemoPreview.tsx`**

Update the `KPIActions` component to embed rich visual previews:

1. **Chart row**: After the "Trend Chart" text, add a compact inline SVG area chart (reuse the data/logic from MiniChart but render a smaller, simplified version — just the line + area fill, no axis labels, no stats footer). Approximately 4-5 lines tall.

2. **Definition row**: After the "Definition" text, add a compact version of the KPIInfo component — showing "Definition" and "Calculation" sections in a small bordered box with sample text.

3. Keep the connecting line (`div className="h-px w-3 bg-border"`) between the icon and the content block.

No other files need to change — the `tourSteps.ts` already passes the correct variant and config.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Enhance `KPIActions` component to include inline mini-chart preview and definition/formula preview within each row |

