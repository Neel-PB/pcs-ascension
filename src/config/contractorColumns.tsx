import { ColumnDef } from '@/types/table';
import { Position } from '@/types/position';
import { BadgeCell } from '@/components/editable-table/cells/BadgeCell';

export const contractorColumns: ColumnDef<Position>[] = [
  {
    id: 'employeeName',
    label: 'Contractor Name',
    type: 'text',
    width: 200,
    minWidth: 180, // Increased to fit header text + icons
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
    minWidth: 130, // Increased for proper display
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
    label: 'Actual FTE',
    type: 'number',
    width: 120,
    minWidth: 110, // Increased for header text
    sortable: true,
    resizable: true,
    draggable: true,
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
