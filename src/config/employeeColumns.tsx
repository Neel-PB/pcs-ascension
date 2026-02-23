import { ColumnDef } from '@/types/table';
import { Position } from '@/types/position';
import { BadgeCell } from '@/components/editable-table/cells/BadgeCell';
import { CommentIndicatorCell } from '@/components/editable-table/cells/CommentIndicatorCell';
import { ShiftCell } from '@/components/editable-table/cells/ShiftCell';
import { TruncatedTextCell } from '@/components/editable-table/cells/TruncatedTextCell';
import { MessageSquare } from '@/lib/icons';

// Type for the shift override handler
type ShiftOverrideHandler = (positionId: string, originalShift: string | null, value: string | null) => void;

export interface EmployeeTotals {
  totalCount: number;
  totalHiredFTE: number;
  totalActiveFTE: number;
}

export const employeeColumns: ColumnDef<Position>[] = [
  {
    id: 'positionNum',
    label: 'Position #',
    type: 'text',
    width: 160,
    minWidth: 150,
    sortable: true,
    resizable: false,
    draggable: true,
    locked: true,
  },
  {
    id: 'employeeName',
    label: 'Employee Name',
    type: 'custom',
    width: 240,
    minWidth: 220,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => (
      <TruncatedTextCell value={row.employeeName} maxLength={30} />
    ),
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
    width: 120,
    minWidth: 100,
    sortable: true,
    resizable: false,
    draggable: true,
    
  },
  {
    id: 'actual_fte',
    label: 'Active FTE',
    type: 'custom',
    width: 120,
    minWidth: 100,
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
    id: 'payrollStatus',
    label: 'Status',
    type: 'badge',
    width: 140,
    minWidth: 130,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => (
      <BadgeCell
        value={row.payrollStatus}
        variant={row.payrollStatus === 'Active' ? 'default' : 'secondary'}
        maxLength={30}
      />
    ),
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

// Function to create columns with comment counts, handlers, and totals
export const createEmployeeColumnsWithComments = (
  commentCounts: Map<string, number>,
  onRowClick: (row: Position) => void,
  onUpdateShiftOverride?: ShiftOverrideHandler,
  totals?: EmployeeTotals
): ColumnDef<Position>[] => {
  // Map columns and enhance with totals + shift handlers
  const columnsWithEnhancements = employeeColumns.map(col => {
    if (col.id === 'employeeName' && totals) {
      return {
        ...col,
        renderHeader: () => (
          <span className="flex items-center gap-1.5">
            Employee Name
            <span className="text-xs text-muted-foreground font-normal">({totals.totalCount.toLocaleString()})</span>
          </span>
        ),
      };
    }
    if (col.id === 'FTE' && totals) {
      return {
        ...col,
        renderHeader: () => (
          <span className="flex flex-col leading-tight">
            <span>Hired FTE</span>
            <span className="text-[10px] text-muted-foreground font-normal">({totals.totalHiredFTE.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })})</span>
          </span>
        ),
      };
    }
    if (col.id === 'actual_fte' && totals) {
      return {
        ...col,
        renderHeader: () => (
          <span data-tour="positions-active-fte" className="flex flex-col leading-tight">
            <span>Active FTE</span>
            <span className="text-[10px] text-muted-foreground font-normal">({totals.totalActiveFTE.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })})</span>
          </span>
        ),
      };
    }
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
    ...columnsWithEnhancements,
    {
      id: 'comments',
      label: 'Comments',
      type: 'custom',
      width: 60,
      minWidth: 60,
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
