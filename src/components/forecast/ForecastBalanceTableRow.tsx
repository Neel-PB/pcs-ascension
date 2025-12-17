import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { ForecastBalanceRow } from "@/hooks/useForecastBalance";
import { BalanceTwoPanel } from "./BalanceTwoPanel";
import { cn } from "@/lib/utils";

interface ForecastBalanceRowProps {
  row: ForecastBalanceRow;
}

export function ForecastBalanceTableRow({ row }: ForecastBalanceRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const gapColor = row.gapType === 'shortage' 
    ? 'text-destructive' 
    : row.gapType === 'surplus' 
      ? 'text-primary' 
      : 'text-muted-foreground';
  
  const gapSign = row.gapType === 'shortage' ? '+' : row.gapType === 'surplus' ? '-' : '';
  
  const StatusIcon = row.gapType === 'shortage' 
    ? TrendingUp 
    : row.gapType === 'surplus' 
      ? TrendingDown 
      : CheckCircle;
  
  const statusColor = row.gapType === 'shortage'
    ? 'text-destructive bg-destructive/10'
    : row.gapType === 'surplus'
      ? 'text-primary bg-primary/10'
      : 'text-emerald-600 bg-emerald-500/10';
  
  return (
    <div className="border-b last:border-b-0">
      {/* Collapsed Row */}
      <div
        className="grid items-center h-12 cursor-pointer hover:bg-muted/50 transition-colors"
        style={{
          gridTemplateColumns: "40px minmax(80px, 1fr) minmax(140px, 1.5fr) minmax(140px, 1.5fr) minmax(80px, 1fr) 80px 100px 120px",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
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
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
            statusColor
          )}>
            <StatusIcon className="h-3 w-3" />
            {row.gapType === 'shortage' ? 'Shortage' : row.gapType === 'surplus' ? 'Surplus' : 'Balanced'}
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-muted/20 px-6 py-4 border-t">
          <BalanceTwoPanel
            hiredFTE={row.hiredFTE}
            targetFTE={row.targetFTE}
            recommendation={row.recommendation}
            aiSummary={row.aiSummary}
          />
        </div>
      )}
    </div>
  );
}
