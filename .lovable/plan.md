

## Fix: Vacancy Rate Modal — Cannot Scroll to Options B & C

### Problem
The Radix `ScrollArea` component wrapping the three chart options does not scroll. This is because Radix ScrollArea requires a concrete height on its viewport to enable scrolling, but the current `flex-1 min-h-0` + inline `maxHeight` combination doesn't propagate correctly through the Radix internals.

### Solution
Replace `ScrollArea` with a plain `div` using `overflow-y-auto` and a calculated max-height. This is simpler and guaranteed to scroll.

### Changes

**`src/components/staffing/KPIChartModal.tsx`** (line ~199)

Replace:
```tsx
<ScrollArea className="flex-1 min-h-0" style={{ maxHeight: 'calc(85vh - 120px)' }}>
  <div className="space-y-8 pr-4 pb-4">
    ...
  </div>
</ScrollArea>
```

With:
```tsx
<div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(85vh - 140px)' }}>
  <div className="space-y-8 pb-4">
    ...
  </div>
</div>
```

This removes the Radix ScrollArea dependency for this section and uses native browser scrolling, which works reliably with dynamic content heights (Option A's height varies based on department count).

