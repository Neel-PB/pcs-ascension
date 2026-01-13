import { ColumnDef } from '@/types/table';
import { Badge } from '@/components/ui/badge';
import { EditableNumberCell } from '@/components/editable-table/cells/EditableNumberCell';
import { EditableDateCell } from '@/components/editable-table/cells/EditableDateCell';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { differenceInDays, format } from 'date-fns';

export interface NPOverrideRow {
  id: string;
  department_id: string;
  department_name: string;
  np_target_volume: number | null;
  np_override_volume: number | null;
  expiry_date: string | null;
  max_expiry_date: Date;
  market: string;
  facility_id: string;
  facility_name: string;
}

export const createNPOverrideColumns = (
  onSaveVolume: (departmentId: string, volume: number | null) => Promise<void>,
  onSaveDate: (departmentId: string, date: string | null) => Promise<void>
): ColumnDef<NPOverrideRow>[] => [
  {
    id: 'department_name',
    label: 'Department',
    type: 'text',
    width: 200,
    minWidth: 150,
    locked: true,
    sortable: true,
    renderCell: (row) => {
      const shouldTruncate = row.department_name.length > 30;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-3 py-2 font-medium truncate max-w-[200px] cursor-default">
              {row.department_name}
            </div>
          </TooltipTrigger>
          {shouldTruncate && (
            <TooltipContent side="top" sideOffset={8} showArrow>
              <p>{row.department_name}</p>
            </TooltipContent>
          )}
        </Tooltip>
      );
    },
  },
  {
    id: 'np_target_volume',
    label: 'NP Target Volume',
    type: 'number',
    width: 150,
    minWidth: 120,
    sortable: true,
    renderCell: (row) => (
      <div className="px-3 py-2 text-center">
        <span className="text-sm font-medium">
          {row.np_target_volume != null ? row.np_target_volume.toLocaleString() : '—'}
        </span>
      </div>
    ),
  },
  {
    id: 'np_override_volume',
    label: 'NP Override Volume',
    type: 'custom',
    width: 180,
    minWidth: 150,
    sortable: true,
    renderCell: (row) => (
      <EditableNumberCell
        value={row.np_override_volume}
        onSave={(value) => onSaveVolume(row.department_id, value)}
      />
    ),
  },
  {
    id: 'max_expiry',
    label: 'Max Expiry',
    type: 'custom',
    width: 150,
    minWidth: 120,
    sortable: true,
    renderCell: (row) => (
      <div className="px-3 py-2">
        <span className="text-sm text-muted-foreground">
          {format(row.max_expiry_date, 'MMM dd, yyyy')}
        </span>
      </div>
    ),
  },
  {
    id: 'expiry_date',
    label: 'Expiry Date',
    type: 'custom',
    width: 200,
    minWidth: 150,
    sortable: true,
    renderCell: (row) => (
      <div className="px-3 py-2">
        <EditableDateCell
          value={row.expiry_date}
          originalValue={null}
          onSave={(value) => onSaveDate(row.department_id, value)}
          minDate={new Date()}
          maxDate={row.max_expiry_date}
        />
      </div>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    type: 'custom',
    width: 150,
    minWidth: 100,
    sortable: true,
    renderCell: (row) => {
      if (!row.np_override_volume || !row.expiry_date) {
        return (
          <div className="px-3 py-2">
            <Badge variant="secondary">Not Set</Badge>
          </div>
        );
      }

      const expiryDate = new Date(row.expiry_date);
      const daysUntilExpiry = differenceInDays(expiryDate, new Date());

      if (daysUntilExpiry < 0) {
        return (
          <div className="px-3 py-2">
            <Badge variant="destructive">Expired</Badge>
          </div>
        );
      }

      if (daysUntilExpiry <= 7) {
        return (
          <div className="px-3 py-2">
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
              Expiring Soon
            </Badge>
          </div>
        );
      }

      return (
        <div className="px-3 py-2">
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Active
          </Badge>
        </div>
      );
    },
  },
];
