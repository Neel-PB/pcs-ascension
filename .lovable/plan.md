

# Fix: Table Header Not Scrolling with Content

## Problem Analysis

After implementing virtualization, the table header no longer scrolls horizontally with the table body. This is because:

1. **Separate scroll containers**: The header is in a wrapper with `minWidth: 'max-content'` but sits outside the scrollable area
2. **Body has its own overflow**: `VirtualizedTableBody` uses `overflow-auto` creating an independent scroll context
3. **No scroll synchronization**: When scrolling the body horizontally, the header doesn't receive the scroll event

## Solution

Restructure the layout so that:
- A single **outer container** handles horizontal scrolling for both header and body
- The **VirtualizedTableBody** only handles vertical scrolling (for virtualization)
- Both header and body share the same horizontal scroll position

## Implementation

### Changes to `EditableTable.tsx`

**Current structure:**
```
<div overflow-hidden>
  <div ref={containerRef}>
    <div minWidth: max-content>
      <TableHeader />        ← Not scrolling
    </div>
    <VirtualizedTableBody /> ← Own scroll container
  </div>
</div>
```

**New structure:**
```
<div overflow-hidden>
  <div ref={containerRef} overflow-x-auto> ← Horizontal scroll here
    <div minWidth: max-content>
      <TableHeader />                      ← Moves with scroll
      <VirtualizedTableBody />             ← Vertical scroll only
    </div>
  </div>
</div>
```

### Changes to `VirtualizedTableBody.tsx`

- Change from `overflow-auto` to `overflow-y-auto overflow-x-hidden`
- This allows vertical scrolling for virtualization while horizontal scroll is handled by the parent

## Files to Modify

1. **`src/components/editable-table/EditableTable.tsx`**
   - Move the horizontal scroll to the containerRef div
   - Wrap both header and body in the same min-width container

2. **`src/components/editable-table/VirtualizedTableBody.tsx`**
   - Change overflow from `overflow-auto` to `overflow-y-auto overflow-x-hidden`

## Expected Result

- Header and body scroll horizontally together
- Vertical virtualized scrolling still works for performance
- Sticky header behavior is preserved within the scroll container

