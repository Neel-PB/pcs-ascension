

## Extend Positions Tour with Active FTE, Shift, and Comments Steps

### Overview
Add 3 new tour steps to the Employees and Contractors tours covering the editable Active FTE cell, the Shift override cell, and the Comments column / detail sheet. Open Positions (Requisitions) only gets a Comments step since it doesn't have Active FTE or Shift editing.

### New Steps

#### Employees Tour (4 existing + 3 new = 7 steps)

5. **Active FTE** -- `[data-tour="positions-active-fte"]` -- "Click the Active FTE cell to adjust a position's working FTE. Select a status reason (LOA, Orientation, Separation, etc.), set an expiration date, and optionally add a comment. Overrides appear in blue and automatically revert when expired."

6. **Shift Override** -- `[data-tour="positions-shift"]` -- "For special shifts (Rotating, Weekend Option, Evening), click the pencil icon to assign a Day or Night selection. The original shift is shown with strikethrough alongside the new value. Use the reset icon to revert."

7. **Comments** -- `[data-tour="positions-comments"]` -- "The comment icon shows how many notes exist for each position. Click any row to open the detail sheet, then switch to the Comments tab to view the activity timeline and add notes."

#### Contractors Tour (4 existing + 3 new = 7 steps)
Same 3 new steps with contractor-specific wording.

#### Requisitions Tour (4 existing + 1 new = 5 steps)
5. **Comments** -- Same comment step with requisition-specific wording.

### Technical Changes

#### `src/components/tour/positionsTourSteps.ts`
- Append 3 new steps to `employeesTourSteps` (Active FTE, Shift, Comments)
- Append 3 new steps to `contractorsTourSteps` (Active FTE, Shift, Comments)
- Append 1 new step to `requisitionsTourSteps` (Comments only)

#### `src/config/employeeColumns.tsx`
- Add `data-tour="positions-active-fte"` wrapper attribute on the Active FTE column's `renderCell`
- Add `data-tour="positions-shift"` wrapper attribute on the Shift column's `renderCell`
- Add `data-tour="positions-comments"` wrapper attribute on the Comments column's `renderCell`

#### `src/config/contractorColumns.tsx`
- Same `data-tour` attributes on Active FTE, Shift, and Comments columns

#### `src/config/requisitionColumns.tsx`
- Add `data-tour="positions-comments"` on the Comments column only

### Approach for data-tour on Table Cells
Since tour steps need a visible DOM element to spotlight, each column's `renderCell` will wrap its content in a `<div data-tour="...">` on the **first row only** (using a row index check or a simple flag). This ensures the spotlight highlights a real, visible cell in the table without adding unnecessary DOM to every row. Alternatively, if the column header is more appropriate, the `renderHeader` can receive the `data-tour` attribute instead -- this avoids per-row logic entirely and clearly labels the feature area.

The simplest approach: add `data-tour` to the **column header** via `renderHeader` for Active FTE, Shift, and Comments. This highlights the column header during the tour, which is clean and doesn't require per-cell logic.
