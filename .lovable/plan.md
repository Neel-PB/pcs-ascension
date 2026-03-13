

## Fix: Y-axis domain — remove empty space on left of chart

The issue is that the Y-axis starts at 0 while the data range is ~350K–400K, leaving a huge empty area below the data line. The fix is to set `domain={['auto', 'auto']}` on all three `<YAxis>` components so Recharts auto-calculates a tight domain based on actual data values.

### Changes — `src/components/staffing/KPIChartModal.tsx`

Add `domain={['auto', 'auto']}` to all three `<YAxis>` instances (area, line, bar chart types) at lines 150, 185, and 215. This tells Recharts to derive min/max from the data rather than defaulting to 0, eliminating the wasted vertical space.

Single file, 3 lines changed.

