

## Make Position KPI Cards Single-Line and Right-Aligned

### Problem

The KPI cards (Employees, Hired FTE, Active FTE) currently stack label and value vertically in two lines. The user wants them displayed in a single row with label and value on the same line, and the cards should be right-aligned (pushed to the right side of the toolbar).

### Changes

| File | Change |
|------|--------|
| `src/components/positions/PositionKPICards.tsx` | Change card layout from vertical (`flex-col`) to horizontal (`flex-row`) with label and value on one line. Adjust height and alignment. |
| `src/pages/positions/EmployeesTab.tsx` | Move `PositionKPICards` into the right-side `div` (with `ml-auto`) so cards sit right-aligned before the action buttons. |

### Details

**PositionKPICards.tsx**
- Change each card from `flex flex-col justify-center` to `flex flex-row items-center gap-2`
- Label and value sit side-by-side: `"Employees  3,157"`
- Keep Helix card styling: `rounded-xl border border-border bg-card shadow-md px-4 h-11`

**EmployeesTab.tsx (and other tabs using the same pattern)**
- Move `<PositionKPICards>` from between SearchField and the action buttons into the `ml-auto` div, placing it before the Refresh/Filter buttons
- This right-aligns the KPI cards naturally

The same pattern will be applied to `ContractorsTab.tsx`, `OpenRequisitionTab.tsx`, and `RequisitionsTab.tsx` if they also use `PositionKPICards`.

