

# Fix Table Scrolling in Positions Module

## Root Cause

The height constraint chain from `ShellLayout > PositionsPage > Tab > EditableTable > VirtualizedTableBody` is broken. The `<main>` element in ShellLayout is a scroll container (`overflow-y-scroll`), and the PositionsPage uses `space-y-6` which adds vertical gaps. This causes the entire page to scroll rather than confining scroll behavior to the table body.

For `@tanstack/react-virtual` to work, the scroll container (`VirtualizedTableBody`'s parent ref div) **must** have a constrained, concrete height. Currently it has `flex-1` but the flex parent doesn't enforce a height limit because the page-level scroll absorbs everything.

## Fix

### 1. `src/pages/positions/PositionsPage.tsx`

- Add `overflow-hidden` to the root `div` (line 128) so the page itself never exceeds its allocated height:
  - From: `flex flex-col h-full space-y-6`
  - To: `flex flex-col h-full space-y-6 overflow-hidden`

This ensures the flex layout properly distributes space and the `flex-1 min-h-0` table container gets a real constrained height.

### 2. `src/pages/positions/EmployeesTab.tsx`

- Add `overflow-hidden` to the root div to ensure the EditableTable fills remaining space without leaking:
  - From: `flex flex-col h-full`  
  - To: `flex flex-col h-full overflow-hidden`

### 3. Same fix for `ContractorsTab.tsx` and `RequisitionsTab.tsx`

Apply identical `overflow-hidden` to their root containers so all three tabs behave consistently.

## What Changes

- The filter bar and tab navigation remain fixed at the top
- The table body becomes the only scrollable area, enabling virtualized row rendering
- Mouse wheel scrolling works inside the table as expected
- No visual changes -- just restored scroll behavior

