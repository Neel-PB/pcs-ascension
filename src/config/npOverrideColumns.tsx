import { ColumnDef } from '@/types/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, ShieldCheck } from '@/lib/icons';
import { EditableDateCell } from '@/components/editable-table/cells/EditableDateCell';
import { OverrideVolumeCell } from '@/components/editable-table/cells/OverrideVolumeCell';
import { TruncatedTextCell } from '@/components/editable-table/cells/TruncatedTextCell';
import { differenceInDays, format } from 'date-fns';

export interface NPOverrideRow {
  id: string;
  department_id: string;
  department_name: string;
  np_target_volume: number | null;
  np_override_volume: number | null;
  pending_volume?: number | null;
  expiry_date: string | null;
  max_expiry_date: Date;
  market: string;
  facility_id: string;
  facility_name: string;
}

export const createNPOverrideColumns = (
  onSaveVolume: (departmentId: string, volume: number | null) => Promise<void>,
  onSaveDate: (departmentId: string, date: string | null) => Promise<void>,
  onDeleteOverride: (departmentId: string) => Promise<void>,
  autoOpenDatePickerFor?: string | null,
  onAutoOpenComplete?: () => void
): ColumnDef<NPOverrideRow>[] => [
  {
    id: 'department_name',
    label: 'Department',
    type: 'text',
    width: 300,
    minWidth: 240,
    locked: true,
    sortable: true,
    renderCell: (row) => (
      <TruncatedTextCell 
        value={row.department_name} 
        className="font-medium"
      />
    ),
  },
  {
    id: 'np_target_volume',
    label: 'Target NP %',
    type: 'number',
    width: 180,
    minWidth: 160,
    sortable: true,
    renderCell: (row) => (
      <div className="flex items-center justify-between gap-2 px-4 py-2 w-full">
        <div className="text-sm font-medium text-right ml-auto">
          {row.np_target_volume != null
            ? row.np_target_volume.toLocaleString(undefined, { maximumFractionDigits: 1 })
            : '—'}
        </div>
      </div>
    ),
  },
  {
    id: 'np_override_volume',
    label: 'Override NP %',
    type: 'custom',
    width: 200,
    minWidth: 180,
    sortable: true,
    renderCell: (row) => {
      const hasPending = row.pending_volume != null;
      const displayValue = row.pending_volume ?? row.np_override_volume;

      return (
        <OverrideVolumeCell
          value={displayValue}
          isPending={hasPending}
          onSave={(value) => onSaveVolume(row.department_id, value)}
          onDelete={() => onDeleteOverride(row.department_id)}
        />
      );
    },
  },
  {
    id: 'expiry_date',
    label: 'Expiration Date',
    type: 'custom',
    width: 220,
    minWidth: 180,
    sortable: true,
    renderCell: (row) => {
      const hasOverride = row.np_override_volume != null;
      const hasPending = row.pending_volume != null;

      // Disabled state when no override and no pending
      if (!hasOverride && !hasPending) {
        return (
          <div className="flex items-center justify-between w-full px-4 py-2 opacity-50 cursor-not-allowed">
            <span className="text-sm text-muted-foreground">—</span>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        );
      }

      return (
        <div className="relative w-full h-full">
          <EditableDateCell
            value={row.expiry_date}
            originalValue={null}
            onSave={(value) => onSaveDate(row.department_id, value)}
            minDate={new Date()}
            maxDate={row.max_expiry_date}
            autoOpen={autoOpenDatePickerFor === row.department_id}
            onAutoOpenComplete={onAutoOpenComplete}
          />
        </div>
      );
    },
  },
  {
    id: 'status',
    label: 'Status',
    type: 'custom',
    width: 150,
    minWidth: 100,
    sortable: true,
    renderCell: (row) => {
      // Pending state: volume set in memory but not saved to DB yet
      if (row.pending_volume != null) {
        return (
          <div className="px-4 py-2">
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              Pending
            </Badge>
          </div>
        );
      }

      // No override volume at all
      if (!row.np_override_volume) {
        return (
          <div className="px-4 py-2">
            <Badge variant="secondary">Not Set</Badge>
          </div>
        );
      }

      // Override volume exists but no expiry date yet
      if (!row.expiry_date) {
        return (
          <div className="px-4 py-2">
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              Incomplete
            </Badge>
          </div>
        );
      }

      const expiryDate = new Date(row.expiry_date);
      const daysUntilExpiry = differenceInDays(expiryDate, new Date());

      if (daysUntilExpiry < 0) {
        return (
          <div className="px-4 py-2">
            <Badge variant="destructive">Expired</Badge>
          </div>
        );
      }

      if (daysUntilExpiry <= 7) {
        return (
          <div className="px-4 py-2">
            <Badge variant="outline" className="border-accent text-accent-foreground">
              Expiring Soon
            </Badge>
          </div>
        );
      }

      return (
        <div className="px-4 py-2">
          <Badge variant="outline" className="border-primary text-primary">
            Active
          </Badge>
        </div>
      );
    },
  },
];
