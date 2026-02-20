import { ColumnDef } from '@/types/table';
import { Position } from '@/types/position';
import { BadgeCell } from '@/components/editable-table/cells/BadgeCell';
import { CommentIndicatorCell } from '@/components/editable-table/cells/CommentIndicatorCell';
import { ShiftCell } from '@/components/editable-table/cells/ShiftCell';
import { TruncatedTextCell } from '@/components/editable-table/cells/TruncatedTextCell';
import { MessageSquare } from '@/lib/icons';

// Type for the shift override handler
type ShiftOverrideHandler = (positionId: string, originalShift: string | null, value: string | null) => void;

export const contractorColumns: ColumnDef<Position>[] = [
  {
    id: 'employeeName',
    label: 'Contractor Name',
    type: 'custom',
    width: 240,
    minWidth: 220,
    sortable: true,
    resizable: false,
    draggable: true,
    locked: true,
    renderCell: (row) => (
      <TruncatedTextCell value={row.employeeName} maxLength={30} />
    ),
  },
  {
    id: 'positionNum',
    label: 'Position #',
    type: 'text',
    width: 160,
    minWidth: 150,
    sortable: true,
    resizable: false,
    draggable: true,
  },
  {
    id: 'jobTitle',
    label: 'Job Title',
    type: 'custom',
    width: 240,
    minWidth: 200,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => (
      <TruncatedTextCell value={row.jobTitle} maxLength={30} />
    ),
  },
  {
    id: 'FTE',
    label: 'Hired FTE',
    type: 'number',
    width: 180,
    minWidth: 170,
    sortable: true,
    resizable: false,
    draggable: true,
    
  },
  {
    id: 'actual_fte',
    label: 'Active FTE',
    type: 'custom',
    width: 180,
    minWidth: 170,
    sortable: true,
    resizable: false,
    draggable: true,
    renderHeader: () => <span data-tour="positions-active-fte">Active FTE</span>,
  },
  {
    id: 'shift',
    label: 'Shift',
    type: 'custom',
    width: 180,
    minWidth: 160,
    sortable: true,
    resizable: false,
    draggable: true,
    renderHeader: () => <span data-tour="positions-shift">Shift</span>,
    renderCell: (row) => <ShiftCell value={row.shift} />,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'custom',
    width: 140,
    minWidth: 130,
    sortable: false,
    resizable: false,
    draggable: true,
    renderCell: () => <BadgeCell value="Contingent" variant="secondary" maxLength={30} />,
  },
  {
    id: 'employmentType',
    label: 'Full/Part Time',
    type: 'custom',
    width: 180,
    minWidth: 170,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => (
      <TruncatedTextCell value={row.employmentType} maxLength={30} />
    ),
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
      width: 80,
      minWidth: 80,
      sortable: false,
      resizable: false,
      draggable: true,
      renderHeader: () => <span data-tour="positions-comments"><MessageSquare className="h-4 w-4" /></span>,
      renderCell: (row) => (
        <CommentIndicatorCell
          count={commentCounts.get(row.id) ?? 0}
          onClick={() => onRowClick(row)}
        />
      ),
    },
  ];
};
