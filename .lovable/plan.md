

## Side-by-Side Nested Donuts with Single Legend

### Problem
Currently the Nursing and Non-Nursing nested donuts are stacked vertically, requiring scrolling. They should be side-by-side, with a wider modal and a single shared legend.

### Changes

#### `src/components/staffing/KPIChartModal.tsx`

1. **Widen modal for nested-pie** (~line 149): Add `isNestedPie` to the width condition so it uses `max-w-5xl` (or similar wider class):
   ```typescript
   className={cn("...", isNestedPie ? "max-w-5xl" : showAllOptions ? "max-w-4xl" : "max-w-3xl")}
   ```

2. **Chart tab layout** (~lines 910-988): Change the nested-pie renderer from vertical `space-y-4` to a horizontal flex layout:
   - Remove `<ScrollArea>` wrapper (no longer needed)
   - Use `flex flex-row` for the two category groups side-by-side
   - Each group gets its own category label + nested donut + Inner/Outer labels
   - Single shared legend below both groups (keep only one at the bottom)

3. **Table tab footer** — no change needed, already works horizontally

### Layout
```text
┌───────────────────────────────────────────────────┐
│  Hired FTEs                           13,035.6    │
├───────────────────────────────────────────────────┤
│  ┌──── Nursing ─────┐   ┌── Non-Nursing ────┐    │
│  │    ╭────────╮     │   │    ╭────────╮     │    │
│  │    │ Night  │     │   │    │ Night  │     │    │
│  │    │╭────╮  │     │   │    │╭────╮  │     │    │
│  │    ││Day │  │     │   │    ││Day │  │     │    │
│  │    │╰────╯  │     │   │    │╰────╯  │     │    │
│  │    ╰────────╯     │   │    ╰────────╯     │    │
│  └───────────────────┘   └───────────────────┘    │
│              [single shared legend]               │
│  Nrs Day | Nrs Night | Non-Nrs Day | Non-Nrs Ngt │
└───────────────────────────────────────────────────┘
```

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`

