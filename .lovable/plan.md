

## Move Column Aggregates to KPI Cards on All Position Tabs

### What Changes
Currently, the Position module tables show aggregate totals (counts, FTE sums) as a second row inside column headers, making headers tall and cluttered. This plan moves those numbers into compact KPI-style cards displayed between the search bar and the table, and simplifies column headers back to a single row.

### New Layout Order (all 5 tabs)
```text
[ Search field                          ] [ Refresh ] [ Filter ]
[ Card: Count ] [ Card: Hired FTE ] [ Card: Active FTE ] ...
[ Table with single-row headers ]
```

### Changes Per File

#### 1. New component: `src/components/positions/PositionKPICards.tsx`
- A lightweight row of small metric cards (not the full Staffing KPICard with charts/modals)
- Each card shows a label and a formatted value
- Compact design: small rounded cards in a horizontal flex row
- Accepts an array of `{ label: string; value: string | number }` items

#### 2. `src/config/employeeColumns.tsx`
- Remove all two-row `renderHeader` overrides from `createEmployeeColumnsWithComments`
- Remove the invisible placeholder rows and the `flex-col` layout from headers
- Keep the `data-tour` attributes on shift/active-fte/comments headers
- Remove `EmployeeTotals` interface (no longer needed in columns)

#### 3. `src/config/contractorColumns.tsx`
- Same changes as employee columns -- remove two-row headers and invisible placeholders
- Remove `ContractorTotals` interface from columns

#### 4. `src/config/requisitionColumns.tsx`
- Same changes -- remove two-row headers and invisible placeholders
- Remove `RequisitionTotals` interface from columns

#### 5. `src/pages/positions/EmployeesTab.tsx`
- Import and render `PositionKPICards` between the search row and table
- Pass cards: "Employees" (count), "Hired FTE" (sum), "Active FTE" (sum)
- Remove `totals` computation passed to `createEmployeeColumnsWithComments`
- Keep the totals `useMemo` but use it for the cards instead

#### 6. `src/pages/positions/ContractorsTab.tsx`
- Import and render `PositionKPICards`
- Pass cards: "Positions" (count), "Contractors" (count), "Hired FTE" (sum), "Active FTE" (sum)
- Remove totals from column creation

#### 7. `src/pages/positions/RequisitionsTab.tsx` (Open Position tab)
- Import and render `PositionKPICards`
- Pass cards: "Open Positions" (count)
- Remove totals from column creation

#### 8. `src/pages/positions/OpenRequisitionTab.tsx`
- Add `PositionKPICards` with "Open Requisitions" showing the dummy data count (5)
- Add search bar, refresh button, and filter button (currently missing)

#### 9. `src/pages/positions/ContractorRequisitionTab.tsx`
- Add `PositionKPICards` with "Contractor Requisitions" showing the dummy data count (5)
- Add search bar, refresh button, and filter button (currently missing)

### Technical Details

**PositionKPICards component design:**
```text
Props: { items: Array<{ label: string; value: string | number }> }
Renders: horizontal flex row of small cards with:
  - Muted background, rounded corners, border
  - Label in text-xs text-muted-foreground
  - Value in text-sm font-semibold
  - Compact padding (px-3 py-2)
```

**Column header simplification:**
- All `renderHeader` overrides that add two-row layouts will be removed
- Headers revert to default single-line rendering (just the label text)
- Special `data-tour` attributes are preserved using simple inline `renderHeader` where needed

### Files Changed
- `src/components/positions/PositionKPICards.tsx` -- new component
- `src/config/employeeColumns.tsx` -- simplify headers
- `src/config/contractorColumns.tsx` -- simplify headers
- `src/config/requisitionColumns.tsx` -- simplify headers
- `src/pages/positions/EmployeesTab.tsx` -- add cards
- `src/pages/positions/ContractorsTab.tsx` -- add cards
- `src/pages/positions/RequisitionsTab.tsx` -- add cards
- `src/pages/positions/OpenRequisitionTab.tsx` -- add cards + toolbar
- `src/pages/positions/ContractorRequisitionTab.tsx` -- add cards + toolbar
