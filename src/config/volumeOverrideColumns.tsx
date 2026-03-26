import { ColumnDef } from '@/types/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  Pencil,
  ShieldAlert,
  ShieldCheck
} from '@/lib/icons';
import { EditableDateCell } from '@/components/editable-table/cells/EditableDateCell';
import { OverrideVolumeCell } from '@/components/editable-table/cells/OverrideVolumeCell';
import { differenceInDays, format } from 'date-fns';
import { 
  getOverrideStatusBadgeColor,
  getOverrideStatusLabel,
  getOverrideStatusTooltip,
  type OverrideCategory,
  type VolumeOverrideConfig
} from '@/lib/volumeOverrideRules';
import { TargetVolumePopover } from '@/components/staffing/TargetVolumePopover';

interface HistoricalMonthData {
  month: string;
  volume: number;
  daysInMonth: number;
}

export interface VolumeOverrideRow {
  id: string;
  department_id: string;
  department_name: string;
  override_volume: number | null;
  pending_volume?: number | null; // NEW: Volume stored in memory before DB save
  expiry_date: string | null;
  market: string;
  facility_id: string;
  facility_name: string;
  // Fields from historical analysis
  historical_months_count?: number;
  historical_months_data?: HistoricalMonthData[];
  target_volume?: number | null;
  override_mandatory?: boolean;
  max_allowed_expiry_date?: Date | null;
  category?: OverrideCategory;
  // New fields for 3-month low logic
  three_month_low_avg?: number | null;
  n_month_avg?: number | null;
  spread_percentage?: number | null;
  used_three_month_low?: boolean;
  lowest_three_months?: string[];
  max_vol_patients?: number | null;
}

export const createVolumeOverrideColumns = (
  onSaveVolume: (departmentId: string, volume: number | null) => Promise<void>,
  onSaveDate: (departmentId: string, date: string | null) => Promise<void>,
  onDeleteOverride: (departmentId: string) => Promise<void>,
  config?: VolumeOverrideConfig,
  autoOpenDatePickerFor?: string | null,
  onAutoOpenComplete?: () => void
): ColumnDef<VolumeOverrideRow>[] => [
  {
    id: 'department_name',
    label: 'Department',
    type: 'text',
    width: 280,
    minWidth: 220,
    locked: true,
    sortable: true,
    renderCell: (row) => (
      <div className="px-4 py-2 text-sm font-medium">
        {row.department_name}
      </div>
    ),
  },
  {
    id: 'target_volume',
    label: 'Target Volume',
    type: 'custom',
    width: 200,
    minWidth: 160,
    sortable: true,
    renderCell: (row) => {
      return (
        <TargetVolumePopover
          historicalMonthsCount={row.historical_months_count ?? 0}
          historicalMonthsData={row.historical_months_data ?? []}
          targetVolume={row.target_volume ?? null}
          minMonthsForTarget={config?.min_months_for_target ?? 3}
          threeMonthLowAvg={row.three_month_low_avg}
          nMonthAvg={row.n_month_avg}
          lowestThreeMonths={row.lowest_three_months}
        />
      );
    },
  },
  {
    id: 'override_volume',
    label: 'Override Volume',
    type: 'custom',
    width: 220,
    minWidth: 180,
    sortable: true,
    renderCell: (row) => {
      const mandatory = row.override_mandatory ?? false;
      const count = row.historical_months_count ?? 0;
      const hasPending = row.pending_volume != null;
      const displayValue = row.pending_volume ?? row.override_volume;

      return (
        <OverrideVolumeCell
          value={displayValue}
          isPending={hasPending}
          maxVolume={row.max_vol_patients}
          onSave={(value) => onSaveVolume(row.department_id, value)}
          onDelete={() => onDeleteOverride(row.department_id)}
          badge={{
            icon: mandatory ? ShieldAlert : ShieldCheck,
            label: getOverrideStatusLabel(mandatory),
            className: getOverrideStatusBadgeColor(mandatory),
            tooltip: getOverrideStatusTooltip(mandatory, count),
          }}
          showWarning={mandatory && !displayValue}
          warningTooltip="Override volume is required due to insufficient historical data"
        />
      );
    },
  },
  {
    id: 'expiry_date',
    label: 'Expiration Date',
    type: 'custom',
    width: 200,
    minWidth: 150,
    sortable: true,
    renderCell: (row) => {
      const hasOverride = row.override_volume != null;
      const hasPending = row.pending_volume != null;
      
      // Disabled state when no override volume set AND no pending volume
      if (!hasOverride && !hasPending) {
        return (
          <div className="flex items-center justify-between w-full px-4 py-2 opacity-50 cursor-not-allowed">
            <span className="text-sm text-muted-foreground">—</span>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        );
      }

      const maxDate = row.max_allowed_expiry_date ? new Date(row.max_allowed_expiry_date) : undefined;
      const currentExpiry = row.expiry_date ? new Date(row.expiry_date) : null;
      const exceedsMax = maxDate && currentExpiry && currentExpiry > maxDate;

      return (
        <div className="relative w-full h-full">
          <EditableDateCell
            value={row.expiry_date}
            originalValue={null}
            onSave={(value) => onSaveDate(row.department_id, value)}
            minDate={new Date()}
            maxDate={maxDate}
            autoOpen={autoOpenDatePickerFor === row.department_id}
            onAutoOpenComplete={onAutoOpenComplete}
          />
          {exceedsMax && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              </TooltipTrigger>
              <TooltipContent>
                Expiration date exceeds maximum allowed date of {format(maxDate, 'MMM dd, yyyy')}
              </TooltipContent>
            </Tooltip>
          )}
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
      if (!row.override_volume) {
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
