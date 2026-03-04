

## Fix Column Widths and Add Comments to All Tabs

### Summary
Set fixed max-widths on specific columns so they don't stretch, let remaining columns (Employee/Contractor Name, Job Title, Vacancy Age) fill available space equally. Add comments column to the two tabs currently missing it (Open Requisitions, Contractor Requisitions).

### Fixed-Width Columns (consistent across all 5 tabs)

| Column | Width | Rationale |
|--------|-------|-----------|
| Position No | 110px | Fits 10 digits |
| Skill Mix | 80px | 3-4 letters |
| Hired FTE | 90px | 4 digits |
| Active FTE | 110px | 10 digits (employees only) |
| Shift | 160px | Keep current |
| Status | 120px | Badge fits |
| Staff Type | 130px | "Full Time" / "Part Time" / "PRN" |
| Comments | 60px | Icon only |
| Vacancy Age | 160px | Badge with "XXd - Urgent" |

Flexible columns (Name, Job Title) will use `flex: 1` equivalent to fill remaining space.

### Technical Approach

**1. Add `maxWidth` to `ColumnDef` type** (`src/types/table.ts`)
- Add optional `maxWidth?: number` property

**2. Update grid template logic** (`src/components/editable-table/EditableTable.tsx`)
- When scaling proportionally, cap columns at their `maxWidth` if defined
- Redistribute extra space only to columns without `maxWidth` (the flexible ones)

**3. Update all column configs** with `maxWidth` on fixed columns:
- `src/config/employeeColumns.tsx` -- Position No, Skill Mix, Hired FTE, Active FTE, Shift, Status, Staff Type, Comments
- `src/config/contractorColumns.tsx` -- same applicable columns
- `src/config/requisitionColumns.tsx` -- same applicable columns

**4. Add comments column to Open Requisitions tab** (`src/pages/positions/OpenRequisitionTab.tsx`)
- Import `CommentIndicatorCell`, `MessageSquare`, `usePositionCommentCounts`
- Add detail sheet for row click / comment click
- Append comments column to inline column definition

**5. Add comments column to Contractor Requisitions tab** (`src/pages/positions/ContractorRequisitionTab.tsx`)
- Same approach as above

### Files Changed
- `src/types/table.ts` -- add `maxWidth`
- `src/components/editable-table/EditableTable.tsx` -- respect `maxWidth` in grid scaling
- `src/config/employeeColumns.tsx` -- set widths and maxWidths
- `src/config/contractorColumns.tsx` -- set widths and maxWidths
- `src/config/requisitionColumns.tsx` -- set widths and maxWidths
- `src/pages/positions/OpenRequisitionTab.tsx` -- add comments column + detail sheet
- `src/pages/positions/ContractorRequisitionTab.tsx` -- add comments column + detail sheet

