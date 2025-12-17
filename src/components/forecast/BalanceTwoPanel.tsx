import { FTEBreakdown, RecommendedChanges, PositionChange } from "@/hooks/useForecastBalance";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceTwoPanelProps {
  hiredFTE: FTEBreakdown;
  targetFTE: number;
  recommendation: RecommendedChanges;
  aiSummary: string;
}

function PercentageBar({ actual, target, label, value }: { actual: number; target: number; label: string; value: number }) {
  const diff = Math.abs(actual - target);
  const isBalanced = diff <= 5;
  const isOver = actual > target;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">target {target}%</span>
          <span className={cn(
            "font-semibold",
            isBalanced ? "text-emerald-600" : isOver ? "text-amber-600" : "text-destructive"
          )}>
            {actual.toFixed(0)}%
          </span>
          {isBalanced && <Check className="h-3.5 w-3.5 text-emerald-600" />}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              isBalanced ? "bg-emerald-500" : isOver ? "bg-amber-500" : "bg-destructive"
            )}
            style={{ width: `${Math.min(actual, 100)}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-16 text-right">{value.toFixed(1)} FTE</span>
      </div>
    </div>
  );
}

function PositionChangeList({ changes, type }: { changes: PositionChange[]; type: string }) {
  if (changes.length === 0) return null;
  
  const action = changes[0]?.action;
  const totalChange = changes.reduce((sum, c) => sum + (c.fteValue * c.count), 0);
  const isOpen = action === 'open';
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{type}</span>
        <span className={cn(
          "font-semibold text-sm",
          isOpen ? "text-emerald-600" : "text-amber-600"
        )}>
          {isOpen ? '+' : '-'}{totalChange.toFixed(1)} FTE
        </span>
      </div>
      <div className="space-y-1">
        {changes.map((change, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            <span>{change.fteValue} FTE × {change.count}</span>
            <span>= {(change.fteValue * change.count).toFixed(1)}</span>
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
  
  const hasRecommendations = recommendation.ft.length > 0 || 
    recommendation.pt.length > 0 || 
    recommendation.prn.length > 0;
  
  return (
    <div className="space-y-4">
      {/* Two Panel Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current State Panel */}
        <Card className="p-4 border-l-4 border-l-muted-foreground/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h4 className="font-semibold text-sm">Current State</h4>
              <span className="text-lg font-bold">{hiredFTE.total.toFixed(1)} FTE</span>
            </div>
            
            <div className="space-y-4">
              <PercentageBar 
                actual={hiredFTE.ftPercent} 
                target={70} 
                label="Full-Time" 
                value={hiredFTE.ft}
              />
              <PercentageBar 
                actual={hiredFTE.ptPercent} 
                target={20} 
                label="Part-Time" 
                value={hiredFTE.pt}
              />
              <PercentageBar 
                actual={hiredFTE.prnPercent} 
                target={10} 
                label="PRN" 
                value={hiredFTE.prn}
              />
            </div>
          </div>
        </Card>
        
        {/* Recommended Panel */}
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h4 className="font-semibold text-sm">Recommended</h4>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">{hiredFTE.total.toFixed(1)}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold text-primary">{targetFTE.toFixed(1)} FTE</span>
              </div>
            </div>
            
            {hasRecommendations ? (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  {isShortage ? 'Positions to Open:' : 'Positions to Close:'}
                </p>
                
                {recommendation.ft.length > 0 && (
                  <PositionChangeList changes={recommendation.ft} type="Full-Time" />
                )}
                
                {recommendation.pt.length > 0 && (
                  <PositionChangeList changes={recommendation.pt} type="Part-Time" />
                )}
                
                {recommendation.prn.length > 0 && (
                  <PositionChangeList changes={recommendation.prn} type="PRN" />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Check className="h-4 w-4 mr-2 text-emerald-600" />
                No changes needed
              </div>
            )}
            
            {/* Target split preview */}
            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-2">Target Split:</div>
              <div className="flex gap-3 text-xs font-medium">
                <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">70% FT</span>
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded">20% PT</span>
                <span className="text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">10% PRN</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* AI Recommendation Block */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex gap-3">
          <div className="shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">AI Recommendation</p>
            <p className="text-sm leading-relaxed">{aiSummary}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
