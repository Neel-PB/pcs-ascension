

## Fix: Stop Main Scroll Reset from Undoing Cell Centering

### Root Cause

In `PositionsTour.tsx` line 84-85, after `scrollIntoView({ block: 'center' })` centers the Active FTE cell vertically, the very next line resets `main` scroll to top:

```typescript
const mainEl = document.querySelector('main');
if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
```

This immediately undoes the vertical centering, pushing the cell back above the visible area.

### Fix

Skip the `main` scroll-to-top for table cell steps. The reset is only needed for non-cell steps (filter bar, tabs, search) to keep the page header visible.

**File: `src/components/tour/PositionsTour.tsx`** (lines 84-85)

Current:
```typescript
const mainEl = document.querySelector('main');
if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
```

New:
```typescript
if (!isTableCellStep) {
  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
}
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Only reset main scroll for non-cell steps (skip for Active FTE, Shift, Comments) |

