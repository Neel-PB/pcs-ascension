import { useState } from 'react';

type ForecastDemoVariant =
  | 'forecast-kpi-preview'
  | 'forecast-table-preview'
  | 'forecast-detail-preview';

interface ForecastDemoPreviewProps {
  variant: ForecastDemoVariant;
}

const ForecastKPIPreview = () => (
  <div className="space-y-2 mt-1">
    <div className="grid grid-cols-2 gap-2">
      {/* Shortage card */}
      <div className="rounded-lg border-2 border-orange-500/40 bg-orange-500/5 px-2.5 py-2">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-[8px] font-semibold uppercase tracking-wide text-orange-600">FTE Shortage</div>
            <div className="text-sm font-bold text-orange-600">+5.0</div>
          </div>
          <div className="w-px h-6 bg-orange-500/30" />
          <div className="text-center">
            <div className="text-[8px] font-semibold uppercase tracking-wide text-orange-600">Positions to Open</div>
            <div className="text-sm font-bold text-orange-600">3</div>
          </div>
        </div>
      </div>
      {/* Surplus card */}
      <div className="rounded-lg border-2 border-primary/40 bg-primary/5 px-2.5 py-2">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-[8px] font-semibold uppercase tracking-wide text-primary">FTE Surplus</div>
            <div className="text-sm font-bold text-primary">-3.2</div>
          </div>
          <div className="w-px h-6 bg-primary/30" />
          <div className="text-center">
            <div className="text-[8px] font-semibold uppercase tracking-wide text-primary">Positions to Close</div>
            <div className="text-sm font-bold text-primary">2</div>
          </div>
        </div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center italic">Click a card to filter the table by gap type</p>
  </div>
);

const FORECAST_ROWS = [
  { market: 'Baltimore', facility: 'Mercy Ctr Aurora', dept: 'Cardiac Care', skill: 'RN', shift: 'Day', gap: 2.4, status: 'Shortage' },
  { market: 'Florida', facility: 'Saint Thomas Mid', dept: 'Adult ECMO 001', skill: 'PCT', shift: 'Night', gap: -1.8, status: 'Surplus' },
  { market: 'Illinois', facility: 'Alexian Brothers', dept: 'Cardiac Crit Care', skill: 'CL', shift: 'Day', gap: 0.6, status: 'Split' },
];

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    Shortage: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
    Surplus: 'bg-primary/10 text-primary border-primary/30',
    Split: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  };
  return (
    <span className={`text-[8px] font-medium rounded px-1.5 py-0.5 border ${colors[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

const ForecastTablePreview = () => (
  <div className="rounded-lg border border-border bg-card overflow-hidden mt-1">
    <div className="overflow-x-auto">
      <table className="w-full text-[9px] leading-tight">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="px-1 py-1 w-3" />
            <th className="px-1.5 py-1 text-left font-semibold text-foreground/80">Market</th>
            <th className="px-1.5 py-1 text-left font-semibold text-foreground/80">Facility</th>
            <th className="px-1.5 py-1 text-left font-semibold text-foreground/80">Department</th>
            <th className="px-1.5 py-1 text-left font-semibold text-foreground/80">Skill</th>
            <th className="px-1.5 py-1 text-left font-semibold text-foreground/80">Shift</th>
            <th className="px-1.5 py-1 text-right font-semibold text-foreground/80">Gap</th>
            <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Status</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {FORECAST_ROWS.map(r => (
            <tr key={r.market} className="border-b border-border/30 hover:bg-muted/20">
              <td className="px-1 py-1 text-muted-foreground text-center">▶</td>
              <td className="px-1.5 py-1 text-foreground/80 font-sans">{r.market}</td>
              <td className="px-1.5 py-1 text-foreground/70 font-sans">{r.facility}</td>
              <td className="px-1.5 py-1 text-foreground/70 font-sans">{r.dept}</td>
              <td className="px-1.5 py-1 text-foreground/80 font-semibold">{r.skill}</td>
              <td className="px-1.5 py-1 text-foreground/70 font-sans">{r.shift}</td>
              <td className={`px-1.5 py-1 text-right font-semibold ${r.gap > 0 ? 'text-orange-600' : r.gap < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {r.gap > 0 ? `+${r.gap.toFixed(1)}` : r.gap.toFixed(1)}
              </td>
              <td className="px-1.5 py-1 text-center font-sans">{statusBadge(r.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ForecastDetailPreview = () => (
  <div className="rounded-lg border border-border bg-card overflow-hidden mt-1">
    <div className="grid grid-cols-2 gap-0 divide-x divide-border">
      {/* Left panel: Current Hired FTE */}
      <div className="p-2.5 space-y-2">
        <div className="text-[10px] font-semibold text-foreground/80">Current Hired FTE</div>
        <div className="space-y-1.5">
          {[
            { label: 'FT', pct: 70, color: 'bg-primary' },
            { label: 'PT', pct: 15, color: 'bg-blue-400' },
            { label: 'PRN', pct: 5, color: 'bg-amber-400' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground w-6 shrink-0">{b.label}</span>
              <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }} />
              </div>
              <span className="text-[8px] font-mono text-muted-foreground w-6 text-right">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel: Recommended Changes */}
      <div className="p-2.5 space-y-2">
        <div className="text-[10px] font-semibold text-foreground/80">Recommended Changes</div>
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5">
            <span className="text-[9px] font-bold text-orange-600 shrink-0">1.</span>
            <div>
              <div className="text-[9px] font-medium text-foreground/80">Cancel Open Req</div>
              <div className="text-[8px] text-muted-foreground">RN-Day</div>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-[9px] font-bold text-emerald-600 shrink-0">2.</span>
            <div>
              <div className="text-[9px] font-medium text-foreground/80">Open Position</div>
              <div className="text-[8px] text-muted-foreground">PCT-Night</div>
            </div>
          </div>
        </div>
        <p className="text-[8px] text-muted-foreground italic leading-snug">Cancels open reqs before closing filled positions</p>
      </div>
    </div>
  </div>
);

export function ForecastDemoPreview({ variant }: ForecastDemoPreviewProps) {
  switch (variant) {
    case 'forecast-kpi-preview':
      return <ForecastKPIPreview />;
    case 'forecast-table-preview':
      return <ForecastTablePreview />;
    case 'forecast-detail-preview':
      return <ForecastDetailPreview />;
    default:
      return null;
  }
}
