

## Migrate KPIChartModal from raw Recharts to shadcn Chart components

### What

Replace direct `recharts` imports (`ResponsiveContainer`, `Tooltip`, etc.) with the project's shadcn `ChartContainer`, `ChartTooltip`, and `ChartTooltipContent` from `@/components/ui/chart`. This also fixes the left-spacing issue since `ChartContainer` wraps `ResponsiveContainer` internally with proper defaults.

### Changes — `src/components/staffing/KPIChartModal.tsx`

1. **Imports**: Replace `ResponsiveContainer, Tooltip` from `recharts` with `ChartContainer, ChartTooltip, ChartTooltipContent` from `@/components/ui/chart`. Keep `LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid` from `recharts` (shadcn chart wraps these, doesn't replace them).

2. **Chart config**: Create a `chartConfig` object based on the dynamic color:
   ```typescript
   const chartConfig = {
     value: { label: title, color: getChartColor() }
   };
   ```

3. **Replace `ResponsiveContainer` wrapper**: Swap the `<div className="h-full w-full"><ResponsiveContainer>` block with `<ChartContainer config={chartConfig} className="h-[300px] w-full">`. This handles responsive sizing internally and injects CSS variables for theming.

4. **Replace `<Tooltip>`**: Swap all three `<Tooltip>` instances with:
   ```tsx
   <ChartTooltip content={<ChartTooltipContent />} />
   ```
   Remove the manual `contentStyle` and `formatter` — `ChartTooltipContent` uses the config labels and applies consistent shadcn styling automatically.

5. **Use CSS variable for colors**: Replace hardcoded `stroke={getChartColor()}` / `fill={getChartColor()}` with `var(--color-value)` which `ChartContainer` injects from the config. The gradient `stopColor` also uses `var(--color-value)`.

6. **Left spacing fix**: Add `margin={{ left: -10, right: 10, top: 5, bottom: 5 }}` to each chart component (`AreaChart`, `LineChart`, `BarChart`) and `width={45}` to each `YAxis` — this tightens the left gap that the user originally reported.

### Scope
Single file. Aligns with shadcn chart patterns already established in `chart.tsx`. Fixes the left spacing issue simultaneously.

