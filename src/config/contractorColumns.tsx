import { ColumnDef } from '@/types/table';
import { Position } from '@/types/position';
import { BadgeCell } from '@/components/editable-table/cells/BadgeCell';
import { BellIndicatorCell } from '@/components/editable-table/cells/BellIndicatorCell';

export const contractorColumns: ColumnDef<Position>[] = [
  {
    id: 'employeeName',
    label: 'Contractor Name',
    type: 'text',
    width: 200,
    minWidth: 200, // Ensure full header text is always visible
    sortable: true,
    resizable: true,
    draggable: true,
    locked: true, // Cannot hide
  },
  {
    id: 'positionNum',
    label: 'Position #',
    type: 'text',
    width: 140,
    minWidth: 140, // Ensure full header text is always visible
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'jobTitle',
    label: 'Job Title',
    type: 'text',
    width: 220,
    minWidth: 150,
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'jobFamily',
    label: 'Job Family',
    type: 'badge',
    width: 180,
    minWidth: 140, // Increased for header text
    sortable: true,
    resizable: true,
    draggable: true,
    renderCell: (row) => (
      <BadgeCell
        value={row.jobFamily}
        variant="outline"
        className="bg-primary/10"
      />
    ),
  },
  {
    id: 'FTE',
    label: 'Hired FTE',
    type: 'number',
    width: 120,
    minWidth: 110,
    sortable: true,
    resizable: true,
    draggable: true,
    tooltip: 'Hired FTEs represents the total number of full-time equivalent employees currently employed and actively working in the department.',
  },
  {
    id: 'actual_fte',
    label: 'Active FTE',
    type: 'custom',
    width: 120,
    minWidth: 110,
    sortable: true,
    resizable: true,
    draggable: true,
    tooltip: 'Active FTEs represents the total number of full-time equivalent employees currently employed and actively working in the department.',
  },
  {
    id: 'shift',
    label: 'Shift',
    type: 'text',
    width: 120,
    minWidth: 100, // Increased from 80
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'custom',
    width: 130,
    minWidth: 110, // Increased for proper display
    sortable: false,
    resizable: true,
    draggable: true,
    renderCell: () => <BadgeCell value="Contingent" variant="secondary" />,
  },
  {
    id: 'employmentFlag',
    label: 'Staff Type',
    type: 'text',
    width: 150,
    minWidth: 130, // Increased for header text
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'employmentType',
    label: 'Full/Part Time',
    type: 'text',
    width: 140,
    minWidth: 140, // Increased to fit full header
    sortable: true,
    resizable: true,
    draggable: true,
  },
];

// Function to create columns with comment counts and handlers
export const createContractorColumnsWithComments = (
  commentCounts: Map<string, number>,
  onRowClick: (row: Position) => void
): ColumnDef<Position>[] => [
  ...contractorColumns,
  {
    id: 'comments',
    label: 'Alerts',
    type: 'custom',
    width: 100,
    minWidth: 90,
    sortable: false,
    resizable: true,
    draggable: true,
    renderCell: (row) => (
      <BellIndicatorCell
        count={commentCounts.get(row.id) ?? 0}
        onClick={() => onRowClick(row)}
      />
    ),
  },
];
