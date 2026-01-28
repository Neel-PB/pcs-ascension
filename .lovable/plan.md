
# Fix Skills Column Width for Nursing and Non-Nursing Views

## Problem

Looking at your screenshots:
- **Nursing view**: Skills column has proper narrow width
- **Non-Nursing view**: Skills column is expanding much wider

This happens because the HTML table automatically redistributes space when columns are hidden. Even though we added `w-48 min-w-48 max-w-48`, the table ignores these constraints due to its default `table-layout: auto` behavior.

## Solution

Add `table-layout: fixed` to the table. This CSS property forces the table to respect explicit column widths rather than auto-calculating them based on content and available space.

## Files to Modify

### 1. `src/pages/staffing/PositionPlanning.tsx`

**Change**: Add `table-fixed` class to the Table component

**Location**: Line 537

```tsx
// Before
<Table>

// After
<Table className="table-fixed">
```

This single change will:
- Force all columns to respect their explicit `w-*` class widths
- Prevent the Skills column from expanding in Non-Nursing view
- Keep the same 192px width (`w-48`) for both Nursing and Non-Nursing views

## How It Works

| CSS Property | Behavior |
|--------------|----------|
| `table-layout: auto` (default) | Table calculates column widths based on content and distributes extra space |
| `table-layout: fixed` | Table respects explicit width values, doesn't redistribute space |

Tailwind's `table-fixed` utility applies `table-layout: fixed`.

## Expected Result

| View | Skills Column Width |
|------|---------------------|
| Nursing | 192px (fixed) |
| Non-Nursing | 192px (fixed) |

Both views will have identical Skills column width that doesn't change when toggling between them.
