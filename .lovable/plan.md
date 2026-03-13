

## Fix: KPI Chart Modal — Remove KPI name from chart, improve formatting

### Problems (from screenshot)
1. The chart legend at the bottom says "12M Average" — this is the KPI title, not useful in a single-series chart. Should be removed.
2. The tooltip shows the KPI name as the series label. Should show the month name and formatted value instead.
3. Y-axis values show decimal places (e.g., "400000.0") — for large volume numbers this is unnecessary and wastes space. Should use compact formatting (e.g., "400K" or comma-separated integers).
4. The stats row (High/Average/Low) values also show one decimal for large numbers — should use locale-formatted numbers with commas.

### Changes

**`src/components/staffing/KPIChartModal.tsx`**:

1. **Remove `<Legend />`** from all three chart types (Area, Line, Bar) — the title is already in the modal header, repeating it in a legend is redundant.

2. **Update Tooltip** — Change the `formatter` to show comma-formatted values and use `labelFormatter` to show the period/month name cleanly. Remove the KPI `name` prop from Area/Line/Bar components (or set it to "Value") so the tooltip doesn't repeat the KPI title.

3. **Fix Y-axis `tickFormatter`** — For large values (>1000), use compact formatting like `Intl.NumberFormat` with comma separators or abbreviations (e.g., "350K"), instead of `.toFixed(decimalPlaces)` which produces "350000.0".

4. **Fix stats formatting** — Use `toLocaleString()` for the High/Average/Low values so they display as "390,397.7" instead of "390397.7".

### Scope
Single file, ~15 lines changed across the three chart type blocks plus stats section.

