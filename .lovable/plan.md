

# Fix Input Overflow in Override NP % Editing State

## Problem

The `flex-1` on the input causes it to expand and push the accept/cancel buttons outside the visible cell area. The editing container itself also uses `flex-1` but has no width constraint, so the input grows unbounded.

## Fix

In `src/components/editable-table/cells/OverrideVolumeCell.tsx`, change the input width from `flex-1 min-w-0` to a fixed reasonable width like `w-24` (96px). This is wide enough for numeric values but leaves room for the check and X buttons within the cell.

**Line ~139 change:**
- From: `className="flex-1 min-w-0 text-sm font-medium ..."`
- To: `className="w-24 text-sm font-medium ..."`

This keeps the input appropriately sized for percentage values while ensuring the accept/cancel buttons remain visible.

