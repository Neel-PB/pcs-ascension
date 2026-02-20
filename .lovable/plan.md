

## Fix Table Height Offsets to Eliminate Page Scroll

### Problem
The current `calc(100vh - var(--header-height) - 240px)` offset is too small for both the Variance Analysis and Position Planning tables. The actual space consumed by elements above the table (shell padding, filter bar, tab navigation, section headers, toggle groups, spacing gaps) totals roughly 270-290px, causing the table to exceed the remaining viewport and trigger page-level scrolling.

### Solution
Increase the offset values so the table `max-h` correctly fits within the remaining viewport space.

### Calculation Breakdown (above each table)

| Element | Height |
|---------|--------|
| Shell `py-4` top padding | 16px |
| Filter bar + `py-2` wrapper | ~72px |
| `mb-6` gap after filters | 24px |
| Tab navigation bar | ~44px |
| `space-y-6` gap (outer) | 24px |
| `space-y-6` gap (inner) | 24px |
| Section header row (title, legend, buttons) | ~48px |
| Shell bottom padding | 16px |
| **Total** | **~268px** |

Adding a small buffer (~12px) for rounding and browser differences gives ~280px. For Position Planning, the two inline toggle groups add ~8px more, but 280px covers both.

To be safe and prevent any edge-case overflow, use **340px** for both tables. This gives enough room and still keeps the table filling most of the viewport.

### Files to Change

| File | Line | Current Offset | New Offset |
|------|------|----------------|------------|
| `src/pages/staffing/PositionPlanning.tsx` | 533 | `240px` | `340px` |
| `src/pages/staffing/VarianceAnalysis.tsx` | 723 | `240px` | `340px` |

### Specific Changes

**PositionPlanning.tsx (line 533)**
```
Before: max-h-[calc(100vh-var(--header-height)-240px)]
After:  max-h-[calc(100vh-var(--header-height)-340px)]
```

**VarianceAnalysis.tsx (line 723)**
```
Before: max-h-[calc(100vh-var(--header-height)-240px)]
After:  max-h-[calc(100vh-var(--header-height)-340px)]
```

This ensures the tables occupy only the remaining viewport space after the header, filters, tabs, and section headers, so only the table scrolls internally and the page never scrolls.
