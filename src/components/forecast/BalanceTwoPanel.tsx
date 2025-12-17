import { FTEBreakdown, RecommendedChanges, PositionChange } from "@/hooks/useForecastBalance";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
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
        <span className="text-xs font-medium">{label}</span>
        <span className={cn(
          "font-semibold",
          isBalanced ? "text-emerald-600" : isOver ? "text-amber-600" : "text-destructive"
        )}>
          {actual.toFixed(0)}%
        </span>
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
        <span className="text-xs text-muted-foreground w-16 text-right">{value.toFixed(1)} FTE</span>
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
        <span className="text-xs font-medium text-foreground">{type}</span>
        <span className="text-xs font-semibold text-foreground">
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
  // Separate recommendations by action type
  const positionsToClose = {
    ft: recommendation.ft.filter(c => c.action === 'close'),
    pt: recommendation.pt.filter(c => c.action === 'close'),
    prn: recommendation.prn.filter(c => c.action === 'close'),
  };
  
  const positionsToOpen = {
    ft: recommendation.ft.filter(c => c.action === 'open'),
    pt: recommendation.pt.filter(c => c.action === 'open'),
    prn: recommendation.prn.filter(c => c.action === 'open'),
  };
  
  const hasClosures = positionsToClose.ft.length > 0 || positionsToClose.pt.length > 0 || positionsToClose.prn.length > 0;
  const hasOpenings = positionsToOpen.ft.length > 0 || positionsToOpen.pt.length > 0 || positionsToOpen.prn.length > 0;
  
  const totalToClose = [...positionsToClose.ft, ...positionsToClose.pt, ...positionsToClose.prn]
    .reduce((sum, c) => sum + (c.fteValue * c.count), 0);
  const totalToOpen = [...positionsToOpen.ft, ...positionsToOpen.pt, ...positionsToOpen.prn]
    .reduce((sum, c) => sum + (c.fteValue * c.count), 0);
  
  return (
    <div className="space-y-4">
      {/* Two Panel Layout - 30/70 split */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '35% 65%' }}>
        {/* Current State Panel - 30% */}
        <Card className="p-4 border-l-4 border-l-muted-foreground/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h4 className="font-semibold text-sm">Current State</h4>
              <span className="text-lg font-bold">{hiredFTE.total.toFixed(1)} FTE</span>
            </div>
            
            <div className="space-y-3">
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
            
            {/* AI Recommendation */}
            <div className="border-t pt-3 mt-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">AI Recommendation</p>
              <p className="text-xs leading-relaxed">{aiSummary}</p>
            </div>
          </div>
        </Card>
        
        {/* Recommended Panel - 70% with dual columns */}
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex flex-col h-full">
            {/* Main content wrapper */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <h4 className="font-semibold text-sm">Recommended</h4>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{hiredFTE.total.toFixed(1)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-primary">{targetFTE.toFixed(1)} FTE</span>
                </div>
              </div>
              
              {/* Dual column layout for Close and Open */}
              <div className="grid grid-cols-2 gap-4">
              {/* Position to Close Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary underline">Position to Close</span>
                  {hasClosures && (
                    <span className="text-xs font-semibold text-primary">-{totalToClose.toFixed(1)} FTE</span>
                  )}
                </div>
                
                {hasClosures ? (
                  <div className="space-y-2">
                    {positionsToClose.ft.length > 0 && (
                      <PositionChangeList changes={positionsToClose.ft} type="Full-Time" />
                    )}
                    {positionsToClose.pt.length > 0 && (
                      <PositionChangeList changes={positionsToClose.pt} type="Part-Time" />
                    )}
                    {positionsToClose.prn.length > 0 && (
                      <PositionChangeList changes={positionsToClose.prn} type="PRN" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-xs text-muted-foreground bg-muted/30 rounded">
                    <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    No closures needed
                  </div>
                )}
              </div>
              
              {/* Position to Open Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary underline">Position to Open</span>
                  {hasOpenings && (
                    <span className="text-xs font-semibold text-primary">+{totalToOpen.toFixed(1)} FTE</span>
                  )}
                </div>
                
                {hasOpenings ? (
                  <div className="space-y-2">
                    {positionsToOpen.ft.length > 0 && (
                      <PositionChangeList changes={positionsToOpen.ft} type="Full-Time" />
                    )}
                    {positionsToOpen.pt.length > 0 && (
                      <PositionChangeList changes={positionsToOpen.pt} type="Part-Time" />
                    )}
                    {positionsToOpen.prn.length > 0 && (
                      <PositionChangeList changes={positionsToOpen.prn} type="PRN" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-xs text-muted-foreground bg-muted/30 rounded">
                    <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    No openings needed
                  </div>
                )}
              </div>
            </div>
            </div>
            
            {/* Target split preview - pinned to bottom */}
            <div className="pt-1.5 border-t mt-auto">
              <div className="text-xs text-muted-foreground mb-1">Target Split:</div>
              <div className="flex gap-2 text-xs font-medium">
                <span className="text-emerald-600 bg-emerald-500/10 px-1.5 py-0 rounded">70% FT</span>
                <span className="text-primary bg-primary/10 px-1.5 py-0 rounded">20% PT</span>
                <span className="text-amber-600 bg-amber-500/10 px-1.5 py-0 rounded">10% PRN</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
    </div>
  );
}
