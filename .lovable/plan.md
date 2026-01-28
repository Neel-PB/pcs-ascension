
Goal
- Fix remaining Positions table header truncation (seen in screenshot: “HIRE…” and “ACTI…”) so the full column titles render.

What’s happening (root cause)
- The only remaining truncated headers are “Hired FTE” and “Active FTE”.
- Those two columns have a tooltip, which adds the Info icon in the header, plus the per-column dropdown chevron. With current widths (120px), the label is forced to truncate by the header’s `truncate` styling.

Approach (minimal, targeted, reliable)
1) Widen only the problematic columns (Employees + Contractors)
- Update:
  - src/config/employeeColumns.tsx
    - Column id: 'FTE' (label “Hired FTE”) -> increase width/minWidth to accommodate label + icons
    - Column id: 'actual_fte' (label “Active FTE”) -> same
  - src/config/contractorColumns.tsx
    - Same two columns
- Target values (recommended):
  - width: 180
  - minWidth: 170
- Expected effect: “HIRED FTE” and “ACTIVE FTE” fit even when the Info icon is present, and still fit when the sort arrow appears.

2) Reset only the Positions tables’ persisted column state (avoid resetting the whole app again)
- Instead of bumping the global zustand persist version again, bump the namespace used by the two affected tables:
  - src/pages/positions/EmployeesTab.tsx
    - EditableTable storeNamespace: "employees-columns" -> "employees-columns-v2"
    - ColumnVisibilityPanel storeNamespace: "employees-columns" -> "employees-columns-v2"
  - src/pages/positions/ContractorsTab.tsx
    - "contractors-columns" -> "contractors-columns-v2"
- Requisitions can stay unchanged because it doesn’t have the tooltip-driven truncation shown in your screenshot.

3) (Small robustness improvement) Fix “Auto-fit Width” for tooltip columns
- src/components/editable-table/EditableTable.tsx
  - In handleColumnAutoFit(), include extra padding when `column.tooltip` is present (Info icon width + gap), so auto-fit doesn’t undershoot and reintroduce header truncation.

Validation / QA checklist
- Go to /positions
- Employees tab:
  - Confirm headers show “HIRED FTE” and “ACTIVE FTE” fully (no ellipsis)
  - Sort by those columns and confirm the arrow icon appearing does not re-truncate the title
  - Open Column Visibility panel and confirm it still works (and that the table uses the new defaults)
- Contractors tab: repeat the same checks

Fallback option (if you want to keep FTE columns narrow)
- If you prefer not to widen columns, an alternative is to remove the dedicated Info icon and show the tooltip when hovering the header label itself. That frees ~20–30px and often eliminates truncation without increasing widths. I can do that if you’d rather keep the table tighter.
