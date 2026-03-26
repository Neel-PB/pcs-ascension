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
              <div className="flex items-baseline gap-2">
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
                <div className="flex items-center justify-between bg-muted/60 rounded px-2 py-1.5 text-xs">
                  <span className="font-medium">{row.employmentType}</span>
                  <span className="font-semibold">{row.hiredFte.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Open Reqs Column */}
          <div>
            <div className="pb-2 border-b">
              <div className="flex items-baseline gap-2">
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
                  <div className="flex items-center justify-between bg-muted/60 rounded px-2 py-1.5 text-xs">
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
              {row.staffingStatus === 'shortage'
                ? `${Math.abs(row.totalFteReq).toFixed(1)} FTE shortage identified. ${row.unaddressedFte > 0 ? `${row.unaddressedFte.toFixed(1)} FTE unaddressed.` : 'All gaps addressed.'}`
                : row.staffingStatus === 'surplus'
                  ? `${Math.abs(row.totalFteReq).toFixed(1)} FTE surplus identified. ${row.addressedFte > 0 ? `${row.addressedFte.toFixed(1)} FTE addressed.` : ''} ${row.unaddressedFte > 0 ? `${row.unaddressedFte.toFixed(1)} FTE unaddressed.` : ''}`
                  : 'Staffing is balanced for this group.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Right Panel: Positions to Close / Open ─── */

function HeadcountBreakdown({ entries }: { entries: FteHeadcountEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="space-y-1">
      {entries.map((entry, i) => {
        const fteVal = parseFloat(String(entry.fte_value)) || 0;
        const hc = parseFloat(String(entry.hc)) || 0;
        return (
          <div key={i} className="flex items-center justify-between text-xs text-muted-foreground bg-primary/10 rounded px-2.5 py-1.5">
            <span>{String(entry.employee_type).toUpperCase()}: {fteVal} FTE │ {hc}</span>
            <span className="font-semibold">= {(fteVal * hc).toFixed(1)}</span>
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
    <Card className="pt-1.5 px-4 pb-1.5 border-l-4 border-l-primary">
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

          <div className="grid grid-cols-2 gap-4 mb-3 mt-4">
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
        <div className="mt-1.5 border-t mt-auto">
          <div className="text-xs text-muted-foreground mb-1">Target FTE:</div>
          <div className="flex gap-2 text-xs font-medium">
            <span className="text-primary bg-primary/10 px-1.5 py-0 rounded">
              {row.targetFte.toFixed(1)} FTE
            </span>
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
      <div className="grid gap-4" style={{ gridTemplateColumns: '45% 55%' }}>
        <LeftPanel row={row} />
        <RightPanel row={row} />
      </div>
    </div>
  );
}
