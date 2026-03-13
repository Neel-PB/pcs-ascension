

## Fix: Tighten spacing in KPI Chart Modal

Looking at the screenshot, there's excessive padding on all sides — the dialog base `p-6`, header `pb-2`, content `space-y-4 pt-2`, stats `pt-4`, and chart container all compound into too much whitespace.

### Changes — `src/components/staffing/KPIChartModal.tsx`

1. **DialogContent**: Change `p-6` override to `p-4` and remove redundant `pb-4` — tightens all outer edges.
2. **DialogHeader**: Remove `pb-2` padding, keep border-b.
3. **Content wrapper**: Change `space-y-4 pt-2` to `space-y-3 pt-1` — reduce vertical gaps between toggle, chart, and stats.
4. **Chart container**: Reduce `h-[340px]` to `h-[300px]` — chart doesn't need that much height given the data range.
5. **Stats row**: Change `pt-4` to `pt-2` and `gap-8` to `gap-6` — tighten the bottom stats section.
6. **Value text**: Reduce header value from `text-4xl` to `text-3xl` to save vertical header space.

Single file changed, spacing-only adjustments.

