import { ColumnDef } from '@/types/table';
import { Position } from '@/types/position';
import { BadgeCell } from '@/components/editable-table/cells/BadgeCell';
import { CommentIndicatorCell } from '@/components/editable-table/cells/CommentIndicatorCell';
import { ShiftCell } from '@/components/editable-table/cells/ShiftCell';
import { MessageSquare } from 'lucide-react';

// Type for the shift override handler
type ShiftOverrideHandler = (positionId: string, originalShift: string | null, value: string | null) => void;

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
    type: 'custom',
    width: 140,
    minWidth: 120,
    sortable: true,
    resizable: true,
    draggable: true,
    renderCell: (row) => <ShiftCell value={row.shift} />,
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
  onRowClick: (row: Position) => void,
  onUpdateShiftOverride?: ShiftOverrideHandler
): ColumnDef<Position>[] => {
  // Map columns and enhance the shift column with handlers
  const columnsWithShift = contractorColumns.map(col => {
    if (col.id === 'shift') {
      return {
        ...col,
        renderCell: (row: Position) => (
          <ShiftCell 
            value={row.shift} 
            selectedDayNight={row.shift_override}
            onSave={(val) => onUpdateShiftOverride?.(row.id, row.shift, val)}
          />
        ),
      };
    }
    return col;
  });

  return [
    ...columnsWithShift,
    {
      id: 'comments',
      label: 'Comments',
      type: 'custom',
      width: 100,
      minWidth: 90,
      sortable: false,
      resizable: true,
      draggable: true,
      renderHeader: () => <MessageSquare className="h-4 w-4" />,
      renderCell: (row) => (
        <CommentIndicatorCell
          count={commentCounts.get(row.id) ?? 0}
          onClick={() => onRowClick(row)}
        />
      ),
    },
  ];
};
