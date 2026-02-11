

# Remove Info Icons from Hired FTE and Active FTE Columns

## What's changing
Remove the tooltip (info icon) from the **Hired FTE** and **Active FTE** columns in the Employees and Contractors tables. Everything else about those columns stays the same.

## Changes

### 1. `src/config/employeeColumns.tsx`
- Remove `tooltip` property from the Hired FTE column (line 72)
- Remove `tooltip` property from the Active FTE column (line 83)

### 2. `src/config/contractorColumns.tsx`
- Remove `tooltip` property from the Hired FTE column (line 72)
- Remove `tooltip` property from the Active FTE column (line 83)

No other files need changes. The Open Positions (Requisitions) tab doesn't have tooltips on these columns.
