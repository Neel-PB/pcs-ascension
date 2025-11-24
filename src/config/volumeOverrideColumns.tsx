import { ColumnDef } from '@/types/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { BadgeWithValue } from '@/components/editable-table/cells/BadgeWithValue';
import { BadgeWithEditableValue } from '@/components/editable-table/cells/BadgeWithEditableValue';
import { EditableDateCell } from '@/components/editable-table/cells/EditableDateCell';
import { differenceInDays, format } from 'date-fns';
import { 
  getCategoryTooltip,
  getHistoricalDataBadgeColor,
  getHistoricalDataLabel,
  getOverrideStatusBadgeColor,
  getOverrideStatusLabel,
  getOverrideStatusTooltip,
  type OverrideCategory 
} from '@/lib/volumeOverrideRules';

export interface VolumeOverrideRow {
  id: string;
  department_id: string;
  department_name: string;
  override_volume: number | null;
  expiry_date: string | null;
  market: string;
  facility_id: string;
  facility_name: string;
  // New fields from historical analysis
  historical_months_count?: number;
  target_volume?: number | null;
  override_mandatory?: boolean;
  max_allowed_expiry_date?: Date | null;
  category?: OverrideCategory;
}

export const createVolumeOverrideColumns = (
  onSaveVolume: (departmentId: string, volume: number | null) => Promise<void>,
  onSaveDate: (departmentId: string, date: string | null) => Promise<void>
): ColumnDef<VolumeOverrideRow>[] => [
  {
    id: 'department_name',
    label: 'Department',
    type: 'text',
    width: 200,
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
    id: 'target_volume',
    label: 'Target Volume',
    type: 'custom',
    width: 240,
    minWidth: 200,
    sortable: true,
    renderCell: (row) => {
      const count = row.historical_months_count ?? 0;
      
      // Get icon based on historical months
      const getIcon = () => {
        if (count === 0) return AlertCircle;
        if (count < 3) return TrendingDown;
        if (count < 12) return TrendingUp;
        return CheckCircle;
      };

      return (
        <BadgeWithValue
          badge={{
            icon: getIcon(),
            label: getHistoricalDataLabel(count),
            className: getHistoricalDataBadgeColor(count),
            tooltip: getCategoryTooltip(count, {
              min_months_for_target: 3,
              min_months_mandatory_override: 2,
              max_override_months_full_history: 12,
              fiscal_year_end_month: 6,
              fiscal_year_end_day: 30,
              enable_backfill: true,
              backfill_lookback_months: 24,
              min_volume_threshold: 0,
            }),
          }}
          value={{
            display: row.target_volume 
              ? row.target_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })
              : "—",
            className: row.target_volume ? "text-foreground" : "text-muted-foreground",
            tooltip: row.target_volume 
              ? `12-month average daily volume based on ${count} months of data`
              : "Insufficient historical data to calculate target volume",
          }}
        />
      );
    },
  },
  {
    id: 'override_volume',
    label: 'Override Volume',
    type: 'custom',
    width: 260,
    minWidth: 220,
    sortable: true,
    renderCell: (row) => {
      const mandatory = row.override_mandatory ?? false;
      const count = row.historical_months_count ?? 0;

      return (
        <BadgeWithEditableValue
          badge={{
            icon: mandatory ? ShieldAlert : ShieldCheck,
            label: getOverrideStatusLabel(mandatory),
            className: getOverrideStatusBadgeColor(mandatory),
            tooltip: getOverrideStatusTooltip(mandatory, count),
          }}
          editableValue={{
            value: row.override_volume,
            onSave: (value) => onSaveVolume(row.department_id, value),
            showWarning: mandatory && !row.override_volume,
            warningTooltip: "Override volume is required due to insufficient historical data",
          }}
        />
      );
    },
  },
  {
    id: 'max_allowed_expiry',
    label: 'Max Expiry',
    type: 'custom',
    width: 150,
    minWidth: 120,
    sortable: true,
    renderCell: (row) => (
      <div className="px-3 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-sm text-muted-foreground">
              {row.max_allowed_expiry_date 
                ? format(new Date(row.max_allowed_expiry_date), 'MMM dd, yyyy')
                : '—'
              }
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Maximum allowed expiry date based on historical data availability
          </TooltipContent>
        </Tooltip>
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
    renderCell: (row) => {
      const maxDate = row.max_allowed_expiry_date ? new Date(row.max_allowed_expiry_date) : undefined;
      const currentExpiry = row.expiry_date ? new Date(row.expiry_date) : null;
      const exceedsMax = maxDate && currentExpiry && currentExpiry > maxDate;

      return (
        <div className="relative px-3 py-2">
          <EditableDateCell
            value={row.expiry_date}
            originalValue={null}
            onSave={(value) => onSaveDate(row.department_id, value)}
            minDate={new Date()}
            maxDate={maxDate}
          />
          {exceedsMax && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              </TooltipTrigger>
              <TooltipContent>
                Expiry date exceeds maximum allowed date of {format(maxDate, 'MMM dd, yyyy')}
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
];
