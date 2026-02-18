

## Fix: Broaden Overflow Cleanup Selectors in StaffingTour

### Root Cause

The `resetScroll` function in `StaffingTour.tsx` only clears inline `overflow` styles on elements matching:
- `[class*="overflow-y-auto"]`
- `[class*="overflow-x-auto"]`

But several scroll containers use different overflow classes that are NOT matched:
- **`Table` component wrapper** (table.tsx line 8): uses `overflow-auto` (no `-y-` or `-x-` prefix)
- **`main` element** (ShellLayout line 53): uses `overflow-y-scroll` (not `overflow-y-auto`)
- **Variance table container** (VarianceAnalysis.tsx line 723): uses `overflow-hidden overflow-x-auto`

When Joyride sets inline `overflow: hidden` on these containers during the tour, the cleanup misses them, leaving the entire page frozen and unscrollable.

### Fix

Update `StaffingTour.tsx` to use a broader selector that catches ALL overflow containers:

```typescript
const resetScroll = () => {
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
    mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    (mainContainer as HTMLElement).style.overflow = '';
  }
  // Match ALL overflow containers: overflow-auto, overflow-y-auto, overflow-x-auto, overflow-y-scroll, etc.
  const scrollContainers = document.querySelectorAll(
    '[class*="overflow-auto"], [class*="overflow-y-auto"], [class*="overflow-x-auto"], [class*="overflow-y-scroll"], [class*="overflow-x-scroll"]'
  );
  scrollContainers.forEach(el => {
    (el as HTMLElement).style.overflow = '';
    (el as HTMLElement).style.overflowX = '';
    (el as HTMLElement).style.overflowY = '';
  });
};
```

Key changes:
1. Add `[class*="overflow-auto"]` to catch the Table component wrapper
2. Add `[class*="overflow-y-scroll"]` and `[class*="overflow-x-scroll"]` to catch the main element
3. Clear `style.overflowX` and `style.overflowY` in addition to `style.overflow`, since Joyride may set axis-specific inline styles
4. Remove the `scrollTo` calls from container cleanup (only reset scroll on `main`) to avoid jarring jumps on the table

### File Changed

| File | Change |
|------|--------|
| `src/components/tour/StaffingTour.tsx` | Broaden overflow cleanup selectors, clear overflowX/overflowY inline styles |

