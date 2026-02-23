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
  // Both shortage and surplus are red
  const gapColor = row.gapType === 'shortage' || row.gapType === 'surplus'
    ? 'text-orange-600' 
    : row.gapType === 'split-imbalanced'
      ? 'text-amber-600'
      : 'text-muted-foreground';
  
  const gapSign = row.gapType === 'shortage' ? '+' : row.gapType === 'surplus' ? '-' : '';
  
  // Status badge colors - red for shortage/surplus, yellow for split issue, green for balanced
  const statusColor = row.gapType === 'shortage' || row.gapType === 'surplus'
    ? 'text-orange-600 bg-orange-500/10'
    : row.gapType === 'split-imbalanced'
      ? 'text-amber-600 bg-amber-500/10'
      : 'text-emerald-600 bg-emerald-500/10';
  
  const statusLabel = row.gapType === 'shortage' 
    ? 'Shortage' 
    : row.gapType === 'surplus' 
      ? 'Surplus' 
      : row.gapType === 'split-imbalanced'
        ? 'Split Issue'
        : 'Balanced';
  
  return (
    <div className="border-b last:border-b-0">
      {/* Collapsed Row */}
      <div
        className="grid items-center h-12 cursor-pointer hover:bg-muted/50 transition-colors"
        style={{
          gridTemplateColumns: "40px minmax(80px, 1fr) minmax(140px, 1.5fr) minmax(140px, 1.5fr) minmax(80px, 1fr) 80px 100px 120px",
          minWidth: 'max-content',
        }}
        onClick={() => onToggle(row.id)}
      >
        <div className="flex justify-center">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="px-2 text-sm truncate">{row.market}</div>
        <div className="px-2 text-sm truncate">{row.facilityName}</div>
        <div className="px-2 text-sm truncate">{row.departmentName}</div>
        <div className="px-2 text-sm">{row.skillType}</div>
        <div className="px-2 text-sm">{row.shift}</div>
        <div className={cn("px-2 text-sm font-semibold", gapColor)}>
          {gapSign}{Math.abs(row.fteGap).toFixed(1)}
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
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-muted/20 border-t sticky left-0" style={{ width: 'min(100%, calc(100vw - 130px))' }}>
          <div className="px-6 py-4 overflow-hidden">
            <BalanceTwoPanel
              hiredFTE={row.hiredFTE}
              targetFTE={row.targetFTE}
              recommendation={row.recommendation}
              aiSummary={row.aiSummary}
            />
          </div>
        </div>
      )}
    </div>
  );
}
