import { ChevronDown, ChevronRight } from "@/lib/icons";
import { ForecastBalanceRow } from "@/hooks/useForecastBalance";
import { BalanceTwoPanel } from "./BalanceTwoPanel";
import { cn } from "@/lib/utils";

interface ForecastBalanceRowProps {
  row: ForecastBalanceRow;
  isExpanded: boolean;
  onToggle: (rowId: string) => void;
}

export function ForecastBalanceTableRow({ row, isExpanded, onToggle }: ForecastBalanceRowProps) {
  const canExpand = row.nursingFlag;

  const gapColor = row.staffingStatus === 'shortage' || row.staffingStatus === 'surplus'
    ? 'text-orange-600' 
    : 'text-muted-foreground';

  const gapSign = row.staffingStatus === 'shortage' ? '+' : row.staffingStatus === 'surplus' ? '-' : '';

  const statusColor = row.staffingStatus === 'shortage'
    ? 'text-orange-600 bg-orange-500/10'
    : row.staffingStatus === 'surplus'
      ? 'text-primary bg-primary/10'
      : 'text-emerald-600 bg-emerald-500/10';

  const statusLabel = row.staffingStatus === 'shortage'
    ? 'Shortage'
    : row.staffingStatus === 'surplus'
      ? 'Surplus'
      : 'Balanced';

  return (
    <div className="border-b last:border-b-0">
      <div
        className={cn(
          "grid items-center h-12 transition-colors",
          canExpand ? "cursor-pointer hover:bg-muted/50" : "opacity-80"
        )}
        style={{
          gridTemplateColumns: "40px minmax(80px, 1fr) minmax(140px, 1.5fr) minmax(140px, 1.5fr) minmax(80px, 1fr) 80px 100px 120px",
          minWidth: 'max-content',
        }}
        onClick={() => canExpand && onToggle(row.id)}
      >
        <div className="flex justify-center">
          {canExpand ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
        <div className="px-2 text-sm truncate">{row.market}</div>
        <div className="px-2 text-sm truncate">{row.facilityName}</div>
        <div className="px-2 text-sm truncate">{row.departmentName}</div>
        <div className="px-2 text-sm">{row.skillType}</div>
        <div className="px-2 text-sm">{row.shift}</div>
        <div className={cn("px-2 text-sm font-semibold", gapColor)}>
          {gapSign}{Math.abs(row.totalFteReq).toFixed(1)}
        </div>
        <div className="px-2">
          <div className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            statusColor
          )}>
            {statusLabel}
          </div>
        </div>
      </div>

      {isExpanded && canExpand && (
        <div className="bg-muted/20 border-t sticky left-0" style={{ width: 'min(100%, calc(100vw - 130px))' }}>
          <div className="px-6 py-4 overflow-hidden">
            <BalanceTwoPanel row={row} />
          </div>
        </div>
      )}
    </div>
  );
}
