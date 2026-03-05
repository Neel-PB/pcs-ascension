

## Remove "Apply Filters" button from PositionsFilterSheet

Since filters already apply on change, the "Apply Filters" button is redundant. Remove it and keep only "Clear Filters".

**File: `src/components/positions/PositionsFilterSheet.tsx`**

In the button row at the bottom (~lines 178-185), remove the "Apply Filters" `Button` and let the "Clear Filters" button take full width.

