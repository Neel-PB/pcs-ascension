

## Fix: Active FTE Cell Spotlight Not Highlighting During Tour

### Problem

The tour tooltip for "Active FTE" (step 7 of 9) renders correctly, but the Joyride **spotlight cutout** (the bright area in the dark overlay) is not visible around the Active FTE cell. The cell exists and has the `data-tour="positions-active-fte-cell"` attribute, but Joyride fails to render the spotlight highlight around it.

### Root Cause

The Active FTE column is positioned further right in the table (after Hired FTE, with columns before it). Inside the table's horizontally scrollable container, Joyride struggles to calculate the correct bounding rectangle for the spotlight when:

1. The target element is inside a deeply nested overflow container (table body with `overflow-x-auto`)
2. `disableScrollParentFix` is enabled -- this prevents Joyride from adjusting for scroll parents, which means the spotlight coordinates may not account for the scroll container offset
3. The `STEP_BEFORE` handler explicitly resets horizontal scroll to `left: 0`, which can push the target out of the visible area or cause a mismatch between where Joyride measured the element and where it ended up

### Fix

**File: `src/components/tour/PositionsTour.tsx`**

1. Remove the horizontal scroll reset (`scrollTo({ left: 0 })`) from the `STEP_BEFORE` handler for the Active FTE, Shift, and Comments steps -- the `scrollIntoView` call already handles making the element visible
2. Add `spotlightPadding: 4` to the Joyride styles to give the spotlight a small visual buffer
3. For the `STEP_BEFORE` handler, only reset the main vertical scroll but allow horizontal scroll to stay at the target element's position

**File: `src/pages/positions/EmployeesTab.tsx`** and **`src/pages/positions/ContractorsTab.tsx`**

4. Ensure the `data-tour` wrapper div has explicit dimensions that Joyride can measure -- add `min-h-[48px]` (matching the row's `h-12`) so the spotlight has a proper bounding box

### Technical Changes

```typescript
// PositionsTour.tsx - Updated STEP_BEFORE handler
if (type === EVENTS.STEP_BEFORE && step?.target) {
  const el = document.querySelector(step.target as string);
  if (el) {
    el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
    // Only reset vertical scroll on main, NOT horizontal scroll on table
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
}
```

```typescript
// EmployeesTab.tsx / ContractorsTab.tsx - Explicit dimensions on wrapper
return row.id === firstRowId 
  ? <div data-tour="positions-active-fte-cell" className="w-full min-h-[48px] flex items-center">{cell}</div> 
  : cell;
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Remove table horizontal scroll reset in STEP_BEFORE, add spotlightPadding |
| `src/pages/positions/EmployeesTab.tsx` | Add explicit min-height and flex alignment to data-tour wrapper |
| `src/pages/positions/ContractorsTab.tsx` | Same wrapper fix as EmployeesTab |

