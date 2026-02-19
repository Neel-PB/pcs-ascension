

## Fix Active FTE Cell Scrolling in Positions Tour

### Problem

When the tour reaches the Active FTE step, `scrollIntoView({ inline: 'nearest', block: 'nearest' })` only scrolls if the target is completely out of view. If the cell is even partially visible, no scrolling happens -- leaving the spotlight and tooltip clipped.

### Fix

In `src/components/tour/PositionsTour.tsx`, change the `scrollIntoView` call for table cell steps to use `'center'` instead of `'nearest'`, so the target cell is always brought to the center of the viewport for maximum visibility.

**Line 79 -- current:**
```typescript
el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
```

**Updated logic:**
```typescript
if (isTableCellStep) {
  el.scrollIntoView({ inline: 'center', block: 'center', behavior: 'instant' });
} else {
  el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
}
```

This centers table cell targets (Active FTE, Shift, Comments) in the viewport while keeping non-cell steps (filter bar, search, etc.) using the less disruptive `nearest` behavior.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Use `scrollIntoView` with `'center'` for table cell steps |

### What stays unchanged
- All step definitions, placements, and demo preview styling
- Overflow/containment management logic
- Tour flow and section transitions

