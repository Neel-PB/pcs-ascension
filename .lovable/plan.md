
Update the pie/donut layout so the donut and legend are centered as one combined block, not centered independently.

1. In `src/components/staffing/KPIChartModal.tsx`, change the pie/donut section from a full-width flex row to a two-layer layout:
   - outer wrapper: full width, only responsible for centering
   - inner wrapper: shrink-to-fit group containing donut + legend

2. Remove the `flex-1` behavior from the donut side in the current pie/donut block (`filteredPieData` section). That `flex-1` is what makes the chart area consume leftover space and causes the legend to visually push the whole composition off-center.

3. Use fixed or bounded widths for both pieces so the pair centers cleanly:
   - donut column: fixed/bounded width like `w-[320px]`
   - legend column: fixed width like `w-48`
   - center the inner group with `justify-center`

4. Keep vertical alignment centered with `items-center`, and slightly tighten the gap between donut and legend if needed so the pair feels balanced.

5. Apply the same centering pattern to any other repeated donut/pie layouts in this file so all donut-style charts behave consistently.

Technical shape:
```tsx
<div className="h-[300px] w-full flex justify-center">
  <div className="inline-flex max-w-full items-center justify-center gap-6">
    <div className="w-[320px] shrink-0 flex items-center justify-center">
      <ChartContainer ... className="h-full w-full">
        {/* Pie / Donut chart */}
      </ChartContainer>
    </div>

    <div className="w-48 shrink-0 flex flex-col gap-2">
      {/* Legend */}
    </div>
  </div>
</div>
```

Result:
- the donut and legend will be visually centered together
- the donut will no longer look offset because of the legend column
- spacing will stay balanced across pie and donut chart modals
