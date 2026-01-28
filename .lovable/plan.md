

# Full-Width Column Content for Positions Module Tables

## Problem Summary

The tables in the Positions module (Employees, Contractors, Requisitions) currently have columns with narrow fixed widths, causing:
- Text content to be truncated (requiring hover tooltips to see full values)
- Column headers that may not fully display their titles

The table already has proportional scaling when the container is wider, but the base column widths are too narrow to show full content.

## Current Column Widths

| Column | Current Width | Current minWidth |
|--------|--------------|------------------|
| Employee/Contractor Name | 180px | 180px |
| Position # | 120px | 120px |
| Job Title | 180px | 180px |
| Job Family | 150px | 150px |
| Hired FTE | 80px | 80px |
| Active FTE | 80px | 80px |
| Shift | 160px | 160px |
| Status | 100px | 100px |
| Staff Type | 130px | 130px |
| Full/Part Time | 120px | 120px |
| Comments | 80px | 80px |

## Solution

Increase column widths to accommodate typical full content without truncation:

| Column | New Width | New minWidth | Rationale |
|--------|-----------|--------------|-----------|
| Employee/Contractor Name | 220px | 180px | Names can be long (e.g., "Christopher Alexander Johnson") |
| Position # | 140px | 120px | Position numbers like "POS-12345-ABC" |
| Job Title | 240px | 180px | Titles like "Senior Clinical Nurse Specialist" |
| Job Family | 200px | 150px | Families like "Clinical Nursing - Critical Care" |
| Hired FTE | 100px | 80px | Values are short but need header space |
| Active FTE | 100px | 80px | Same as Hired FTE |
| Shift | 180px | 160px | "Day/Evening Rotation" patterns |
| Status | 120px | 100px | Badge width + padding |
| Staff Type | 160px | 130px | "Regular Employee" etc. |
| Full/Part Time | 140px | 120px | "Part Time" with padding |
| Comments | 100px | 80px | Icon + count badge |
| Position Lifecycle | 180px | 160px | "Approved - Posted" etc. |
| Vacancy Age | 160px | 140px | "45d - Attention" badges |
| Employment Type | 160px | 140px | "Full Time" etc. |

## Implementation

### Files to Modify

1. **`src/config/employeeColumns.tsx`** - Update all column width values
2. **`src/config/contractorColumns.tsx`** - Update all column width values  
3. **`src/config/requisitionColumns.tsx`** - Update all column width values
4. **`src/stores/useColumnStore.ts`** - Increment version to reset persisted widths

### Technical Details

**Step 1: Update Employee Columns**
```tsx
// src/config/employeeColumns.tsx
{
  id: 'employeeName',
  label: 'Employee Name',
  width: 220,      // was 180
  minWidth: 180,
  // ...
},
{
  id: 'positionNum',
  label: 'Position #',
  width: 140,      // was 120
  minWidth: 120,
  // ...
},
// ... update all columns similarly
```

**Step 2: Update Contractor Columns**
Same pattern as employee columns.

**Step 3: Update Requisition Columns**
Same pattern with requisition-specific columns.

**Step 4: Reset Persisted Column State**
```tsx
// src/stores/useColumnStore.ts
persist(
  // ...
  {
    name: 'editable-table-columns',
    version: 2,  // was 1 - increment to reset stored widths
  }
)
```

This version increment will cause the persisted localStorage data to be cleared, allowing the new default widths to take effect for all users.

## Visual Impact

```text
BEFORE:
┌────────────────┬─────────┬────────────────┬───────────┐
│ Employee Na... │ Posit...│ Job Titl...    │ Job Fam...│
├────────────────┼─────────┼────────────────┼───────────┤
│ Christopher... │ POS-... │ Senior Cli...  │ Clinical..│
└────────────────┴─────────┴────────────────┴───────────┘

AFTER:
┌──────────────────────┬─────────────┬────────────────────────┬─────────────────────┐
│ Employee Name        │ Position #  │ Job Title              │ Job Family          │
├──────────────────────┼─────────────┼────────────────────────┼─────────────────────┤
│ Christopher Johnson  │ POS-12345   │ Senior Clinical Nurse  │ Clinical Nursing    │
└──────────────────────┴─────────────┴────────────────────────┴─────────────────────┘
```

## Notes

- The proportional scaling in `EditableTable` will continue to expand columns when extra space is available
- Tooltips will still appear on hover for edge cases where content exceeds the new widths
- Users who have customized column widths via drag-resize will have their settings reset (due to version increment), but can re-customize as needed

