import { useState } from "react";
import { ForecastBalanceRow, FteHeadcountEntry, ForecastSubRow, EmpTypeSplit } from "@/hooks/useForecastBalance";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, ChevronDown, ChevronRight } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BalanceTwoPanelProps {
  row: ForecastBalanceRow;
}

const employeeTypeLabels: Record<string, string> = {
  'Full-Time': 'Full Time',
  'FT': 'Full Time',
  'Part-Time': 'Part Time',
  'PT': 'Part Time',
  'PRN': 'PRN',
};

const typeColors: Record<string, string> = {
  'Full-Time': 'bg-orange-500/10 text-orange-700',
  'FT': 'bg-orange-500/10 text-orange-700',
  'Part-Time': 'bg-emerald-500/10 text-emerald-700',
  'PT': 'bg-emerald-500/10 text-emerald-700',
  'PRN': 'bg-primary/10 text-primary',
};

const DISPLAY_TYPES = ['Full-Time', 'Part-Time', 'PRN'] as const;

function normalizeEmpType(t: string): string {
  if (!t) return '';
  const upper = t.toUpperCase().trim();
  if (upper === 'FT' || upper === 'FULL-TIME' || upper === 'FULL TIME') return 'Full-Time';
  if (upper === 'PT' || upper === 'PART-TIME' || upper === 'PART TIME') return 'Part-Time';
  if (upper === 'PRN') return 'PRN';
  return t;
}

function getLabel(t: string): string {
  if (!t) return 'Unknown';
  return employeeTypeLabels[t] || employeeTypeLabels[normalizeEmpType(t)] || t;
}

function getColor(t: string): string {
  if (!t) return 'bg-muted/60 text-muted-foreground';
  return typeColors[t] || typeColors[normalizeEmpType(t)] || 'bg-muted/60 text-muted-foreground';
}

/* ─── Left Panel: Current Workforce ─── */

function LeftPanel({ row }: { row: ForecastBalanceRow }) {
  // Build FT/PT/PRN split from empltypeSplitHiredOpen, always show all 3
  const splitMap = new Map<string, { hired: number; openReqs: number }>();
  for (const dt of DISPLAY_TYPES) {
    splitMap.set(dt, { hired: 0, openReqs: 0 });
  }

  for (const s of row.empltypeSplitHiredOpen) {
    const norm = normalizeEmpType(s.employment_type);
    const existing = splitMap.get(norm);
    if (existing) {
      existing.hired += s.hired_fte;
      existing.openReqs += s.open_reqs_fte;
    } else {
      splitMap.set(norm, { hired: s.hired_fte, openReqs: s.open_reqs_fte });
    }
  }

  // Compute mix percentages for summary
  const totalHired = Array.from(splitMap.values()).reduce((a, b) => a + b.hired, 0);
  const mixParts = DISPLAY_TYPES.map(t => {
    const val = splitMap.get(t)!;
    const pct = totalHired > 0 ? Math.round((val.hired / totalHired) * 100) : 0;
    return { type: t, pct };
  });

  const shiftLabel = row.shift ? row.shift.charAt(0).toUpperCase() + row.shift.slice(1) : '';
  const skill = row.skillType || '';
  const gap = Math.abs(row.totalFteReq).toFixed(1);

  let summaryText = '';
  if (row.staffingStatus === 'surplus') {
    const mixStr = mixParts.map(m => `${m.pct}% ${getLabel(m.type)}`).join(' / ');
    summaryText = `Current mix: ${mixStr}. There is a ${gap} FTE surplus for ${skill} ${shiftLabel} shift. Consider closing surplus positions to optimize staffing.`;
  } else if (row.staffingStatus === 'shortage') {
    const mixStr = mixParts.map(m => `${m.pct}% ${getLabel(m.type)}`).join(' / ');
    summaryText = `Current mix: ${mixStr}. There is a ${gap} FTE shortage for ${skill} ${shiftLabel} shift. Consider opening new positions to fill the gap.`;
  } else {
    summaryText = `Staffing is balanced for ${skill} ${shiftLabel} shift workforce.`;
  }

  return (
    <Card className="pt-3 px-5 pb-3 border-l-4 border-l-muted-foreground/30">
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-2 gap-6">
          {/* Hired FTE Column */}
          <div>
            <div className="pb-2 border-b">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Hired FTE</span>
                <span className="text-lg font-bold">{row.hiredFte.toFixed(1)}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {DISPLAY_TYPES.map(t => {
                const val = splitMap.get(t)!;
                return (
                  <div key={t} className={cn("flex items-center justify-between rounded px-2 py-1.5 text-xs", getColor(t))}>
                    <span className="font-medium">{getLabel(t)}</span>
                    <span className="font-semibold">{val.hired.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open Reqs Column */}
          <div>
            <div className="pb-2 border-b">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Open Reqs</span>
                <span className="text-lg font-bold">{row.openReqsFte.toFixed(1)}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {DISPLAY_TYPES.map(t => {
                const val = splitMap.get(t)!;
                return (
                  <div key={t} className={cn("flex items-center justify-between rounded px-2 py-1.5 text-xs", getColor(t))}>
                    <span className="font-medium">{getLabel(t)}</span>
                    <span className="font-semibold">{val.openReqs.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-3 mt-auto">
          <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
          <p className="text-xs leading-relaxed">{summaryText}</p>
        </div>
      </div>
    </Card>
  );
}

/* ─── Right Panel: Recommended Actions ─── */

function PositionsToCloseSection({ subRows }: { subRows: ForecastSubRow[] }) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const closeRows = subRows.filter(sr =>
    sr.staffingStatus === 'pos_to_close' || sr.staffingStatus.includes('close')
  );

  if (closeRows.length === 0) return null;

  // Group by employment type
  const grouped = new Map<string, { count: number; posIds: (string | number)[] }>();
  for (const sr of closeRows) {
    const key = normalizeEmpType(sr.employmentType);
    const existing = grouped.get(key) || { count: 0, posIds: [] };
    existing.count += sr.posNbrToClose.length;
    existing.posIds.push(...sr.posNbrToClose);
    grouped.set(key, existing);
  }

  const toggleExpand = (type: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-primary underline">Position to Close</span>
      {Array.from(grouped).map(([type, data]) => (
        <div key={type} className="space-y-1">
          <div
            className={cn("flex items-center justify-between rounded px-2.5 py-1.5 text-xs cursor-pointer", getColor(type))}
            onClick={() => data.posIds.length > 0 && toggleExpand(type)}
          >
            <div className="flex items-center gap-1">
              {data.posIds.length > 0 && (
                expandedTypes.has(type)
                  ? <ChevronDown className="h-3 w-3" />
                  : <ChevronRight className="h-3 w-3" />
              )}
              <span className="font-medium">{getLabel(type)}</span>
            </div>
            <span className="font-semibold">Close {data.count} position{data.count !== 1 ? 's' : ''}</span>
          </div>
          {expandedTypes.has(type) && data.posIds.length > 0 && (
            <div className="ml-4 flex flex-wrap gap-1.5 py-1.5">
              {data.posIds.map((id) => (
                <Badge key={String(id)} variant="outline" className="text-[10px] px-2 py-0.5 font-mono">
                  {String(id)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PositionsToOpenSection({ subRows }: { subRows: ForecastSubRow[] }) {
  const openRows = subRows.filter(sr =>
    sr.staffingStatus === 'pos_to_open' || sr.staffingStatus.includes('open')
  );

  if (openRows.length === 0) return null;

  // Group fte_headcount_json entries by employment type then by fte_value
  const allEntries: (FteHeadcountEntry & { empType: string })[] = [];
  for (const sr of openRows) {
    for (const entry of sr.fteHeadcountJson) {
      allEntries.push({ ...entry, empType: normalizeEmpType(String(entry.employee_type)) });
    }
  }

  // Group by empType
  const byType = new Map<string, Map<number, { hc: number; total: number }>>();
  for (const e of allEntries) {
    const fteVal = parseFloat(String(e.fte_value)) || 0;
    const hc = parseFloat(String(e.hc)) || 0;
    if (!byType.has(e.empType)) byType.set(e.empType, new Map());
    const fteMap = byType.get(e.empType)!;
    const existing = fteMap.get(fteVal);
    if (existing) {
      existing.hc += hc;
      existing.total += fteVal * hc;
    } else {
      fteMap.set(fteVal, { hc, total: fteVal * hc });
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-primary underline">Position to Open</span>
      {Array.from(byType).map(([type, fteMap]) => (
        <div key={type} className="space-y-1">
          {Array.from(fteMap).map(([fteVal, { hc, total }]) => (
            <div key={`${type}_${fteVal}`} className={cn("flex items-center justify-between text-xs rounded px-2.5 py-1.5", getColor(type))}>
              <span>{getLabel(type)}: {fteVal} FTE x {hc}</span>
              <span className="font-semibold">= {total.toFixed(1)} FTE</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function RightPanel({ row }: { row: ForecastBalanceRow }) {
  const currentFte = row.hiredFte + row.openReqsFte;
  const fteGap = row.totalFteReq;
  const gapSign = fteGap > 0 ? '+' : fteGap < 0 ? '' : '';
  const gapLabel = fteGap > 0 ? 'Surplus' : fteGap < 0 ? 'Shortage' : 'Balanced';

  const hasCloseActions = row.subRows.some(sr =>
    sr.staffingStatus === 'pos_to_close' || sr.staffingStatus.includes('close')
  );
  const hasOpenActions = row.subRows.some(sr =>
    sr.staffingStatus === 'pos_to_open' || sr.staffingStatus.includes('open')
  );
  const hasAnyActions = hasCloseActions || hasOpenActions;

  // Compute target employment mix from empltypeSplitHiredOpen
  const targetTotal = row.targetFte;
  const splitMap = new Map<string, number>();
  for (const s of row.empltypeSplitHiredOpen) {
    const norm = normalizeEmpType(s.employment_type);
    splitMap.set(norm, (splitMap.get(norm) || 0) + s.hired_fte + s.open_reqs_fte);
  }

  const pillColors: Record<string, string> = {
    'Full-Time': 'bg-orange-500/15 text-orange-700',
    'Part-Time': 'bg-emerald-500/15 text-emerald-700',
    'PRN': 'bg-primary/15 text-primary',
  };

  return (
    <Card className="pt-3 px-5 pb-3 border-l-4 border-l-primary">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-semibold text-sm">Recommended Actions</h4>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">FTE Gap</div>
                <div className={cn("text-sm font-bold", fteGap > 0 ? 'text-primary' : fteGap < 0 ? 'text-orange-600' : 'text-emerald-600')}>
                  {gapSign}{Math.abs(fteGap).toFixed(1)} ({gapLabel})
                </div>
              </div>
            </div>
          </div>

          {/* Current vs Target */}
          <div className="flex items-center gap-3 py-2 border-b">
            <div className="text-xs">
              <span className="text-muted-foreground">Current: </span>
              <span className="font-semibold">{currentFte.toFixed(1)} FTE</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="text-xs">
              <span className="text-muted-foreground">Target: </span>
              <span className="font-bold text-primary">{row.targetFte.toFixed(1)} FTE</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 space-y-4">
            {hasAnyActions ? (
              <>
                {hasCloseActions && <PositionsToCloseSection subRows={row.subRows} />}
                {hasOpenActions && <PositionsToOpenSection subRows={row.subRows} />}
              </>
            ) : (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground bg-muted/30 rounded">
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                No action required
              </div>
            )}
          </div>
        </div>

        {/* Target Employment Mix footer */}
        <div className="border-t pt-2 mt-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground">Target Mix:</span>
            {DISPLAY_TYPES.map(t => {
              const val = splitMap.get(t) || 0;
              const pct = targetTotal > 0 ? Math.round((val / targetTotal) * 100) : 0;
              return (
                <span key={t} className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", pillColors[t] || 'bg-muted text-muted-foreground')}>
                  {getLabel(t)} {pct}%
                </span>
              );
            })}
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
