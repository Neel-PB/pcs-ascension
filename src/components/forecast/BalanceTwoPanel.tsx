import { FTEBreakdown, RecommendedChanges, PositionChange, ClosureRecommendation } from "@/hooks/useForecastBalance";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, FileX, Users } from "lucide-react";
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
          <div key={i} className="flex items-center justify-between text-xs text-muted-foreground bg-primary/10 rounded px-2 py-1">
            <span>{change.fteValue} FTE × {change.count}</span>
            <span>= {(change.fteValue * change.count).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// New component for closure lists with source distinction
function ClosureChangeList({ 
  changes, 
  type, 
  source 
}: { 
  changes: PositionChange[]; 
  type: string; 
  source: 'reqs' | 'employed';
}) {
  if (changes.length === 0) return null;
  
  const totalChange = changes.reduce((sum, c) => sum + (c.fteValue * c.count), 0);
  const bgColor = source === 'reqs' ? 'bg-emerald-500/10' : 'bg-amber-500/10';
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{type}</span>
        <span className="text-xs font-semibold text-foreground">
          -{totalChange.toFixed(1)} FTE
        </span>
      </div>
      <div className="space-y-1">
        {changes.map((change, i) => (
          <div key={i} className={cn("flex items-center justify-between text-xs text-muted-foreground rounded px-2 py-1", bgColor)}>
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
  // Get closure recommendations with priority split
  const { ftClosure, ptClosure, prnClosure } = recommendation;
  
  // Check if there are any closures from each source
  const hasReqClosures = ftClosure.totalFromReqs > 0 || ptClosure.totalFromReqs > 0 || prnClosure.totalFromReqs > 0;
  const hasEmployedClosures = ftClosure.totalFromEmployed > 0 || ptClosure.totalFromEmployed > 0 || prnClosure.totalFromEmployed > 0;
  const hasAnyClosures = hasReqClosures || hasEmployedClosures;

  const totalReqClosures = ftClosure.totalFromReqs + ptClosure.totalFromReqs + prnClosure.totalFromReqs;
  const totalEmployedClosures = ftClosure.totalFromEmployed + ptClosure.totalFromEmployed + prnClosure.totalFromEmployed;
  const totalClosures = totalReqClosures + totalEmployedClosures;

  // Positions to Open (unchanged)
  const positionsToOpen = {
    ft: recommendation.ft.filter(c => c.action === 'open'),
    pt: recommendation.pt.filter(c => c.action === 'open'),
    prn: recommendation.prn.filter(c => c.action === 'open'),
  };
  
  const hasOpenings = positionsToOpen.ft.length > 0 || positionsToOpen.pt.length > 0 || positionsToOpen.prn.length > 0;
  
  const totalToOpen = [...positionsToOpen.ft, ...positionsToOpen.pt, ...positionsToOpen.prn]
    .reduce((sum, c) => sum + (c.fteValue * c.count), 0);
  
  return (
    <div className="space-y-4">
      {/* Two Panel Layout - 35/65 split */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '35% 65%' }}>
        {/* Current State Panel - 35% */}
        <Card className="pt-1.5 px-4 pb-0 border-l-4 border-l-muted-foreground/30">
          <div className="flex flex-col h-full">
            {/* TOP: Title + FTE bars */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="font-semibold text-sm">Current State</h4>
                <span className="text-lg font-bold">{hiredFTE.total.toFixed(1)} FTE</span>
              </div>
              
              <div className="space-y-2 mt-2">
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
            
            {/* BOTTOM: AI Recommendation - pinned with mt-auto */}
            <div className="bg-muted/60 rounded-md p-1.5 mt-auto space-y-1">
              <p className="text-xs font-medium text-muted-foreground">AI Recommendation</p>
              <p className="text-xs leading-relaxed">{aiSummary}</p>
            </div>
          </div>
        </Card>
        
        {/* Recommended Panel - 65% with dual columns */}
        <Card className="pt-1.5 px-4 pb-1.5 border-l-4 border-l-primary">
          <div className="flex flex-col h-full">
            {/* Main content wrapper */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="font-semibold text-sm">Recommended</h4>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{hiredFTE.total.toFixed(1)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-primary">{targetFTE.toFixed(1)} FTE</span>
                </div>
              </div>
              
              {/* Dual column layout for Close and Open */}
              <div className="grid grid-cols-2 gap-4">
                {/* Position to Close Column - Now with two-tier system */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary underline">Position to Close</span>
                    {hasAnyClosures && (
                      <span className="text-xs font-semibold text-primary">-{totalClosures.toFixed(1)} FTE</span>
                    )}
                  </div>
                  
                  {hasAnyClosures ? (
                    <div className="space-y-3">
                      {/* Open Requisitions to Cancel - Primary (Green) */}
                      {hasReqClosures && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <FileX className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Open Requisitions to Cancel</span>
                            <span className="text-xs text-emerald-600 ml-auto">-{totalReqClosures.toFixed(1)}</span>
                          </div>
                          <div className="pl-1 space-y-2">
                            {ftClosure.fromReqs.length > 0 && (
                              <ClosureChangeList changes={ftClosure.fromReqs} type="Full-Time" source="reqs" />
                            )}
                            {ptClosure.fromReqs.length > 0 && (
                              <ClosureChangeList changes={ptClosure.fromReqs} type="Part-Time" source="reqs" />
                            )}
                            {prnClosure.fromReqs.length > 0 && (
                              <ClosureChangeList changes={prnClosure.fromReqs} type="PRN" source="reqs" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional from Employed - Secondary (Amber) */}
                      {hasEmployedClosures && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">
                              {hasReqClosures ? 'Additional from Employed' : 'From Employed Positions'}
                            </span>
                            <span className="text-xs text-amber-600 ml-auto">-{totalEmployedClosures.toFixed(1)}</span>
                          </div>
                          <div className="pl-1 space-y-2">
                            {ftClosure.fromEmployed.length > 0 && (
                              <ClosureChangeList changes={ftClosure.fromEmployed} type="Full-Time" source="employed" />
                            )}
                            {ptClosure.fromEmployed.length > 0 && (
                              <ClosureChangeList changes={ptClosure.fromEmployed} type="Part-Time" source="employed" />
                            )}
                            {prnClosure.fromEmployed.length > 0 && (
                              <ClosureChangeList changes={prnClosure.fromEmployed} type="PRN" source="employed" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4 text-xs text-muted-foreground bg-primary/10 rounded">
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
                    <div className="flex items-center justify-center py-4 text-xs text-muted-foreground bg-primary/10 rounded">
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
