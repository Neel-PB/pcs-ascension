import { ColumnDef } from '@/types/table';
import { Position } from '@/types/position';
import { BadgeCell } from '@/components/editable-table/cells/BadgeCell';

export const employeeColumns: ColumnDef<Position>[] = [
  {
    id: 'employeeName',
    label: 'Employee Name',
    type: 'text',
    width: 200,
    minWidth: 150,
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
    minWidth: 100,
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
    label: 'Skill Type',
    type: 'badge',
    width: 180,
    minWidth: 120,
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
    label: 'Actual FTE',
    type: 'number',
    width: 120,
    minWidth: 80,
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'shift',
    label: 'Shift',
    type: 'text',
    width: 120,
    minWidth: 80,
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'payrollStatus',
    label: 'Status',
    type: 'badge',
    width: 130,
    minWidth: 100,
    sortable: true,
    resizable: true,
    draggable: true,
    renderCell: (row) => (
      <BadgeCell
        value={row.payrollStatus}
        variant={row.payrollStatus === 'Active' ? 'default' : 'secondary'}
      />
    ),
  },
  {
    id: 'employmentFlag',
    label: 'Staff Type',
    type: 'text',
    width: 150,
    minWidth: 100,
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'employmentType',
    label: 'Full/Part Time',
    type: 'text',
    width: 140,
    minWidth: 100,
    sortable: true,
    resizable: true,
    draggable: true,
  },
];
