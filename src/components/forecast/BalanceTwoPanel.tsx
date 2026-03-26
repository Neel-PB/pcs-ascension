import { ForecastBalanceRow, FteHeadcountEntry } from "@/hooks/useForecastBalance";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface BalanceTwoPanelProps {
  row: ForecastBalanceRow;
}

/* ─── Left Panel: Hired FTE + Open Reqs ─── */

function LeftPanel({ row }: { row: ForecastBalanceRow }) {
  const isNA = row.employmentType === 'NA';

  return (
    <Card className="pt-3 px-5 pb-3 border-l-4 border-l-muted-foreground/30">
      <div className="flex flex-col h-full">
        {/* Two-column: Hired FTE left, Open Reqs right */}
        <div className="grid grid-cols-2 gap-6">
          {/* Hired FTE Column */}
          <div>
            <div className="pb-2 border-b">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Hired FTE</span>
                <span className="text-lg font-bold">{row.hiredFte.toFixed(1)}</span>
              </div>
            </div>
            {isNA ? (
              <div className="py-3 text-xs text-muted-foreground italic">
                Employment type not specified
              </div>
            ) : (
              <div className="mt-4">
                <div className={cn("flex items-center justify-between rounded px-2 py-1.5 text-xs", typeColors[row.employmentType] || 'bg-muted/60 text-muted-foreground')}>
                  <span className="font-medium">{row.employmentType}</span>
                  <span className="font-semibold">{row.hiredFte.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Open Reqs Column */}
          <div>
            <div className="pb-2 border-b">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Open Reqs</span>
                <span className="text-lg font-bold">{row.openReqsFte.toFixed(1)}</span>
              </div>
            </div>
            {row.openReqsFte > 0 ? (
              isNA ? (
                <div className="py-3 text-xs text-muted-foreground italic">
                  Employment type not specified
                </div>
              ) : (
                <div className="mt-4">
                <div className={cn("flex items-center justify-between rounded px-2 py-1.5 text-xs", typeColors[row.employmentType] || 'bg-muted/60 text-muted-foreground')}>
                  <span className="font-medium">{row.employmentType}</span>
                  <span className="font-semibold">{row.openReqsFte.toFixed(1)}</span>
                </div>
                </div>
              )
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-center py-1.5 text-xs text-muted-foreground">
                  No open reqs
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary section */}
        <div className="border-t pt-3 mt-auto">
          <div className="mb-1.5 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Summary</p>
            <p className="text-xs leading-relaxed">
              {(() => {
                const shiftLabel = row.shift ? row.shift.charAt(0).toUpperCase() + row.shift.slice(1) : '';
                const skill = row.skillType || '';

                // Compute current mix % from fteHeadcountJson
                const mixMap = new Map<string, number>();
                for (const entry of row.fteHeadcountJson) {
                  const t = String(entry.employee_type).toUpperCase();
                  const fte = (parseFloat(String(entry.fte_value)) || 0) * (parseFloat(String(entry.hc)) || 0);
                  mixMap.set(t, (mixMap.get(t) || 0) + fte);
                }
                const mixTotal = Array.from(mixMap.values()).reduce((a, b) => a + b, 0);
                const ftPct = mixTotal > 0 ? Math.round(((mixMap.get('FT') || 0) / mixTotal) * 100) : 0;
                const ptPct = mixTotal > 0 ? Math.round(((mixMap.get('PT') || 0) / mixTotal) * 100) : 0;
                const prnPct = mixTotal > 0 ? Math.round(((mixMap.get('PRN') || 0) / mixTotal) * 100) : 0;
                const hasMix = mixTotal > 0;
                const mixStr = hasMix ? `${ftPct}% FT / ${ptPct}% PT / ${prnPct}% PRN` : '';
                const gap = Math.abs(row.totalFteReq).toFixed(1);

                if (row.staffingStatus === 'surplus') {
                  const parts: string[] = [];
                  if (hasMix) parts.push(`Based on your current mix of ${mixStr}`);
                  if (row.addressedFte > 0) parts.push(`we recommend canceling ${row.addressedFte.toFixed(1)} FTE in open requisitions`);
                  if (row.unaddressedFte > 0) parts.push(`additionally closing ${row.unaddressedFte.toFixed(1)} FTE from employed positions`);
                  if (row.addressedFte > 0) parts.push('We recommend first canceling open requisitions before considering any employed position changes');
                  const action = parts.length > 0 ? parts.join(', ') + '.' : `${gap} FTE surplus identified.`;
                  return `${action} This will reduce the ${gap} FTE surplus while achieving the optimal 70/20/10 split for your ${skill} ${shiftLabel} shift workforce.`;
                }
                if (row.staffingStatus === 'shortage') {
                  // Build breakdown string from headcount
                  const breakdownParts: string[] = [];
                  const agg = new Map<string, number>();
                  for (const e of row.fteHeadcountJson) {
                    const t = String(e.employee_type).toUpperCase();
                    const fte = (parseFloat(String(e.fte_value)) || 0) * (parseFloat(String(e.hc)) || 0);
                    agg.set(t, (agg.get(t) || 0) + fte);
                  }
                  for (const [t, fte] of agg) {
                    const label = employeeTypeLabels[t] || t;
                    breakdownParts.push(`${fte.toFixed(1)} FTE in ${label} positions`);
                  }
                  const breakdownStr = breakdownParts.length > 0 ? breakdownParts.join(', ') : `${gap} FTE`;
                  const prefix = hasMix ? `Based on your current mix of ${mixStr}, we recommend opening ${breakdownStr}` : `We recommend opening ${breakdownStr}`;
                  return `${prefix}. This will address the ${gap} FTE shortage while achieving the optimal 70/20/10 split for your ${skill} ${shiftLabel} shift workforce.`;
                }
                return `Staffing is balanced for your ${skill} ${shiftLabel} shift workforce.`;
              })()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Right Panel: Positions to Close / Open ─── */

const employeeTypeLabels: Record<string, string> = {
  FT: 'Full Time',
  PT: 'Part Time',
  PRN: 'PRN',
};

const typeColors: Record<string, string> = {
  FT: 'bg-orange-500/10 text-orange-700',
  PT: 'bg-emerald-500/10 text-emerald-700',
  PRN: 'bg-primary/10 text-primary',
};

function HeadcountBreakdown({ entries }: { entries: FteHeadcountEntry[] }) {
  if (entries.length === 0) return null;

  const aggregated = new Map<string, { type: string; fteVal: number; totalHc: number; totalFte: number }>();
  for (const entry of entries) {
    const type = String(entry.employee_type).toUpperCase();
    const fteVal = parseFloat(String(entry.fte_value)) || 0;
    const hc = parseFloat(String(entry.hc)) || 0;
    const key = `${type}_${fteVal}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.totalHc += hc;
      existing.totalFte += fteVal * hc;
    } else {
      aggregated.set(key, { type, fteVal, totalHc: hc, totalFte: fteVal * hc });
    }
  }

  return (
    <div className="space-y-1">
      {Array.from(aggregated).map(([key, { type, fteVal, totalHc, totalFte }]) => {
        const label = employeeTypeLabels[type] || type;
        return (
          <div key={key} className={cn("flex items-center justify-between text-xs rounded px-2.5 py-1.5", typeColors[type] || 'bg-muted/60 text-muted-foreground')}>
            <span>{label}: {fteVal} FTE x {totalHc}</span>
            <span className="font-semibold">= {totalFte.toFixed(1)} FTE</span>
          </div>
        );
      })}
    </div>
  );
}

function RightPanel({ row }: { row: ForecastBalanceRow }) {
  const isSurplus = row.staffingStatus === 'surplus';
  const isShortage = row.staffingStatus === 'shortage';
  const hasOpenReqs = row.openReqsFte > 0;
  const isCancelReq = row.actionTypes.includes('CANCEL_OPEN_REQ');

  return (
    <Card className="pt-3 px-5 pb-3 border-l-4 border-l-primary">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-semibold text-sm">Recommended Actions</h4>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{row.hiredFte.toFixed(1)}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold text-primary">{row.targetFte.toFixed(1)} FTE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-3 mt-4">
            {/* Positions to Close */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary underline">Position to Close</span>
                {isSurplus && (
                  <span className="text-xs font-semibold text-primary">
                    {Math.abs(row.totalFteReq).toFixed(1)} FTE
                  </span>
                )}
              </div>

              {isSurplus ? (
                <div className="space-y-2">
                  {isCancelReq && hasOpenReqs ? (
                    <div className="text-xs text-muted-foreground bg-primary/10 rounded px-2 py-2 space-y-1">
                      <p>
                        <span className="font-semibold">{row.addressedFte.toFixed(1)}</span> open positions to be cancelled
                      </p>
                      {row.unaddressedFte > 0 && (
                        <p>
                          <span className="font-semibold">{row.unaddressedFte.toFixed(3)}</span> unaddressed
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground bg-primary/10 rounded px-2 py-2 space-y-1">
                      {row.addressedFte > 0 && <p>Addressed: {row.addressedFte.toFixed(1)} FTE</p>}
                      {row.unaddressedFte > 0 && <p>Unaddressed: {row.unaddressedFte.toFixed(1)} FTE</p>}
                      {row.addressedFte === 0 && row.unaddressedFte === 0 && <p>No action required</p>}
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

            {/* Positions to Open */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary underline">Position to Open</span>
                {isShortage && (
                  <span className="text-xs font-semibold text-primary">
                    {Math.abs(row.totalFteReq).toFixed(1)} FTE
                  </span>
                )}
              </div>

              {isShortage ? (
                <div className="space-y-2">
                  {row.fteHeadcountJson.length > 0 ? (
                    <HeadcountBreakdown entries={row.fteHeadcountJson} />
                  ) : (
                    <div className="text-xs text-muted-foreground bg-primary/10 rounded px-2 py-2">
                      {Math.abs(row.totalFteReq).toFixed(1)} FTE to be opened
                    </div>
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

        {/* Target info footer */}
        <div className="border-t pt-2 mt-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground">Target FTE:</span>
            <span className="text-sm font-bold text-primary">{row.targetFte.toFixed(1)}</span>
            {(() => {
              // Compute per-type share from fteHeadcountJson
              const typeShares = new Map<string, number>();
              for (const entry of row.fteHeadcountJson) {
                const t = String(entry.employee_type).toUpperCase();
                const fte = (parseFloat(String(entry.fte_value)) || 0) * (parseFloat(String(entry.hc)) || 0);
                typeShares.set(t, (typeShares.get(t) || 0) + fte);
              }
              const total = Array.from(typeShares.values()).reduce((a, b) => a + b, 0);
              if (total <= 0) return null;
              return Array.from(typeShares).map(([t, fte]) => {
                const pct = Math.round((fte / total) * 100);
                const label = employeeTypeLabels[t] || t;
                const pillColors: Record<string, string> = {
                  FT: 'bg-orange-500/15 text-orange-700',
                  PT: 'bg-emerald-500/15 text-emerald-700',
                  PRN: 'bg-primary/15 text-primary',
                };
                return (
                  <span key={t} className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", pillColors[t] || 'bg-muted text-muted-foreground')}>
                    {label} {pct}%
                  </span>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Main Component ─── */

export function BalanceTwoPanel({ row }: BalanceTwoPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-5" style={{ gridTemplateColumns: '45% 55%' }}>
        <LeftPanel row={row} />
        <RightPanel row={row} />
      </div>
    </div>
  );
}
