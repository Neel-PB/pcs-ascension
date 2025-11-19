import { ColumnDef } from '@/types/table';
import { Position } from '@/types/position';
import { BadgeCell } from '@/components/editable-table/cells/BadgeCell';
import { CommentIndicatorCell } from '@/components/editable-table/cells/CommentIndicatorCell';
import { ShiftCell } from '@/components/editable-table/cells/ShiftCell';
import { differenceInDays } from 'date-fns';
import { MessageSquare } from 'lucide-react';

// Helper to calculate vacancy age
const getVacancyAge = (statusDate: string | null) => {
  if (!statusDate) return null;
  return differenceInDays(new Date(), new Date(statusDate));
};

// Helper to get vacancy badge
const getVacancyBadge = (days: number | null) => {
  if (!days) return { variant: 'secondary' as const, label: '—' };
  if (days > 60)
    return { variant: 'destructive' as const, label: `${days}d - Urgent` };
  if (days > 30)
    return { variant: 'secondary' as const, label: `${days}d - Attention` };
  return { variant: 'default' as const, label: `${days}d - On Track` };
};

export const requisitionColumns: ColumnDef<Position>[] = [
  {
    id: 'positionNum',
    label: 'Position #',
    type: 'text',
    width: 140,
    minWidth: 140, // Ensure full header text is always visible
    sortable: true,
    resizable: true,
    draggable: true,
    locked: true,
  },
  {
    id: 'positionLifecycle',
    label: 'Position Lifecycle',
    type: 'text',
    width: 200,
    minWidth: 200, // Ensure full header text is always visible
    sortable: true,
    resizable: true,
    draggable: true,
  },
  {
    id: 'vacancyAge',
    label: 'Vacancy Age',
    type: 'custom',
    width: 180,
    minWidth: 140, // Increased for header text
    sortable: true,
    resizable: true,
    draggable: true,
    getValue: (row) => getVacancyAge(row.positionStatusDate),
    renderCell: (row) => {
      const days = getVacancyAge(row.positionStatusDate);
      const badge = getVacancyBadge(days);
      return <BadgeCell value={badge.label} variant={badge.variant} />;
    },
    sortFn: (a, b) => {
      const aDays = getVacancyAge(a.positionStatusDate) ?? 0;
      const bDays = getVacancyAge(b.positionStatusDate) ?? 0;
      return aDays - bDays;
    },
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
    id: 'employmentType',
    label: 'Employment Type',
    type: 'text',
    width: 160,
    minWidth: 160, // Increased to fit full header
    sortable: true,
    resizable: true,
    draggable: true,
  },
];

// Function to create columns with comment counts and handlers
export const createRequisitionColumnsWithComments = (
  commentCounts: Map<string, number>,
  onRowClick: (row: Position) => void
): ColumnDef<Position>[] => [
  ...requisitionColumns,
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
