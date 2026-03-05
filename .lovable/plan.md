

## Fix: Hide dash for zero-count comments

**File: `src/components/editable-table/cells/CommentIndicatorCell.tsx`**

When `count === 0`, render nothing (empty cell). Only show the badge when `count > 0`. Also ensure the badge is centered within the cell.

