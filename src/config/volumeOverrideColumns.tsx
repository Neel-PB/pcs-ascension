import { ColumnDef } from '@/types/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { EditableNumberCell } from '@/components/editable-table/cells/EditableNumberCell';
import { EditableDateCell } from '@/components/editable-table/cells/EditableDateCell';
import { differenceInDays } from 'date-fns';

export interface VolumeOverrideRow {
  id: string;
  department_id: string;
  department_name: string;
  override_volume: number | null;
  expiry_date: string | null;
  market: string;
  facility_id: string;
  facility_name: string;
}

export const createVolumeOverrideColumns = (
  onSaveVolume: (departmentId: string, volume: number | null) => Promise<void>,
  onSaveDate: (departmentId: string, date: string | null) => Promise<void>,
  onDelete: (id: string) => void
): ColumnDef<VolumeOverrideRow>[] => [
  {
    id: 'department_name',
    label: 'Department',
    type: 'text',
    width: 250,
    minWidth: 150,
    locked: true,
    sortable: true,
    renderCell: (row) => (
      <div className="px-3 py-2 font-medium">
        {row.department_name}
      </div>
    ),
  },
  {
    id: 'override_volume',
    label: 'Override Volume',
    type: 'custom',
    width: 200,
    minWidth: 150,
    sortable: true,
    renderCell: (row) => (
      <EditableNumberCell
        value={row.override_volume}
        originalValue={null}
        onSave={(value) => onSaveVolume(row.department_id, value)}
      />
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
      <EditableDateCell
        value={row.expiry_date}
        originalValue={null}
        onSave={(value) => onSaveDate(row.department_id, value)}
        minDate={new Date()}
      />
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
      if (!row.override_volume || !row.expiry_date) {
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
  {
    id: 'actions',
    label: 'Actions',
    type: 'custom',
    width: 100,
    minWidth: 80,
    renderCell: (row) => (
      <div className="px-3 py-2">
        {row.override_volume && row.expiry_date && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.id)}
            className="h-8 w-8 p-0"
            title="Remove override"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
  },
];
