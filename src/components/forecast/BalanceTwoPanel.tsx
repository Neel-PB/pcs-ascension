import { FTEBreakdown, RecommendedChanges, PositionChange } from "@/hooks/useForecastBalance";
import { Check, AlertTriangle, ArrowRight } from "lucide-react";

interface BalanceTwoPanelProps {
  hiredFTE: FTEBreakdown;
  targetFTE: number;
  recommendation: RecommendedChanges;
  aiSummary: string;
}

function PercentageIndicator({ actual, target, label }: { actual: number; target: number; label: string }) {
  const diff = Math.abs(actual - target);
  const isBalanced = diff <= 5;
  const isOver = actual > target;
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label} (target {target}%)</span>
      <div className="flex items-center gap-2">
        <span className={isBalanced ? "text-emerald-600" : "text-amber-600"}>
          {actual.toFixed(0)}%
        </span>
        {isBalanced ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <span className="text-xs text-amber-600">
            {isOver ? 'Over' : 'Under'}
          </span>
        )}
      </div>
    </div>
  );
}

function PositionChangeList({ changes, type }: { changes: PositionChange[]; type: string }) {
  if (changes.length === 0) return null;
  
  const action = changes[0]?.action;
  const totalChange = changes.reduce((sum, c) => sum + (c.fteValue * c.count), 0);
  const actionColor = action === 'open' ? 'text-emerald-600' : 'text-amber-600';
  const actionSymbol = action === 'open' ? '+' : '-';
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-medium">{type}:</span>
        <span className={actionColor}>
          {actionSymbol}{totalChange.toFixed(1)} FTE
        </span>
      </div>
      <div className="pl-4 text-sm text-muted-foreground space-y-0.5">
        {changes.map((change, i) => (
          <div key={i}>
            {change.fteValue} × {change.count} = {(change.fteValue * change.count).toFixed(1)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BalanceTwoPanel({
  hiredFTE,
  targetFTE,
  recommendation,
  aiSummary,
}: BalanceTwoPanelProps) {
  const gap = targetFTE - hiredFTE.total;
  const isShortage = gap > 0;
  
  return (
    <div className="space-y-4">
      {/* Two Panel Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current State Panel */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold">Current State</h4>
            <span className="text-lg font-bold">{hiredFTE.total.toFixed(1)} FTE</span>
          </div>
          
          <div className="space-y-3">
            <PercentageIndicator actual={hiredFTE.ftPercent} target={70} label="Full-Time" />
            <div className="pl-4 text-sm text-muted-foreground">
              {hiredFTE.ft.toFixed(1)} FTE
            </div>
            
            <PercentageIndicator actual={hiredFTE.ptPercent} target={20} label="Part-Time" />
            <div className="pl-4 text-sm text-muted-foreground">
              {hiredFTE.pt.toFixed(1)} FTE
            </div>
            
            <PercentageIndicator actual={hiredFTE.prnPercent} target={10} label="PRN" />
            <div className="pl-4 text-sm text-muted-foreground">
              {hiredFTE.prn.toFixed(1)} FTE
            </div>
          </div>
        </div>
        
        {/* Recommended Panel */}
        <div className="bg-primary/5 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold">Recommended</h4>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{hiredFTE.total.toFixed(1)}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">{targetFTE.toFixed(1)} FTE</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-2">
              {isShortage ? 'Positions to Open:' : 'Positions to Close:'}
            </div>
            
            {recommendation.ft.length > 0 && (
              <PositionChangeList changes={recommendation.ft} type="Full-Time" />
            )}
            
            {recommendation.pt.length > 0 && (
              <PositionChangeList changes={recommendation.pt} type="Part-Time" />
            )}
            
            {recommendation.prn.length > 0 && (
              <PositionChangeList changes={recommendation.prn} type="PRN" />
            )}
            
            {recommendation.ft.length === 0 && 
             recommendation.pt.length === 0 && 
             recommendation.prn.length === 0 && (
              <p className="text-sm text-muted-foreground">No changes needed</p>
            )}
          </div>
          
          {/* Target split preview */}
          <div className="pt-2 border-t text-sm">
            <div className="text-muted-foreground mb-1">Target Split:</div>
            <div className="flex gap-3">
              <span className="text-emerald-600">70% FT</span>
              <span className="text-primary">20% PT</span>
              <span className="text-amber-600">10% PRN</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Recommendation Block */}
      <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
        <p className="text-sm leading-relaxed">
          {aiSummary}
        </p>
      </div>
    </div>
  );
}
