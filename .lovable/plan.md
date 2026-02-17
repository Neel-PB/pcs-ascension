

## Show Active FTE Edit & Shift Override Cells in Positions Tour

Currently the tour highlights the **column headers** for Active FTE and Shift. This change will make the tour spotlight the actual **first-row cells** so users can see the pencil icon, the editable cell styling, and understand what to click.

### Approach

Use the existing `isFirstRow` pattern: compare each row's ID against the first item in the dataset, then conditionally wrap the cell in a `div` with a `data-tour` attribute.

### Changes (4 files)

#### 1. `src/pages/positions/EmployeesTab.tsx`
In the `columnsWithHandlers` memo, wrap the `actual_fte` and `shift` column `renderCell` outputs with a `data-tour` div when the row is the first item:

- For `actual_fte`: wrap `EditableFTECell` in `<div data-tour="positions-active-fte-cell">` when `row.id === filteredAndSortedEmployees[0]?.id`
- For `shift`: similarly wrap the `ShiftCell` in `<div data-tour="positions-shift-cell">` for the first row

#### 2. `src/pages/positions/ContractorsTab.tsx`
Same pattern as EmployeesTab — wrap first-row Active FTE and Shift cells with `data-tour` attributes.

#### 3. `src/components/tour/positionsTourSteps.ts`
Update the `employeesTourSteps` and `contractorsTourSteps` arrays:

- Change the Active FTE step target from `[data-tour="positions-active-fte"]` (header) to `[data-tour="positions-active-fte-cell"]` (first row cell)
- Change the Shift step target from `[data-tour="positions-shift"]` (header) to `[data-tour="positions-shift-cell"]` (first row cell)

#### 4. `src/components/tour/PositionsTour.tsx`
Apply the same scroll fixes as AdminTour to prevent tabs from becoming unusable after tour completion:

- Set `scrollToFirstStep={false}`
- Use `behavior: 'instant'` for `scrollIntoView` and main container reset during steps
- Reset both outer `main` and inner scroll containers on completion

### Technical Detail

The `renderCell` function receives the row data object. By comparing `row.id === data[0]?.id` (where `data` is the filtered/sorted array), the `data-tour` attribute is only added to the very first visible row. This avoids redundant DOM attributes on all 7,000+ rows while ensuring the tour spotlight targets a real, interactive cell.
