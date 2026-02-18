type SettingsDemoVariant =
  | 'volume-stats-preview'
  | 'volume-table-preview'
  | 'volume-target-preview'
  | 'np-stats-preview'
  | 'np-table-preview'
  | 'np-two-step-preview';

interface SettingsDemoPreviewProps {
  variant: SettingsDemoVariant;
}

/* ─── Volume Previews ─── */

const VolumeStatsPreview = () => (
  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 mt-1">
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-destructive" />
      <span className="text-[10px] font-semibold text-foreground/80">2</span>
      <span className="text-[9px] text-muted-foreground">Require Override</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-primary" />
      <span className="text-[10px] font-semibold text-foreground/80">5</span>
      <span className="text-[9px] text-muted-foreground">Using Target Volume</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-amber-500" />
      <span className="text-[10px] font-semibold text-foreground/80">1</span>
      <span className="text-[9px] text-muted-foreground">Expiring Soon</span>
    </div>
  </div>
);

const VOL_ROWS = [
  { dept: 'Cardiac Care', target: 18.5, override: null, mandatory: true, expiry: null, status: 'Not Set' },
  { dept: 'Adult ECMO 001', target: 22.3, override: 25.0, mandatory: false, expiry: 'Mar 15, 2026', status: 'Active' },
  { dept: 'Cardiac Crit Care', target: 14.8, override: 16.0, mandatory: false, expiry: 'Pending...', status: 'Pending' },
];

const volStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'bg-primary/10 text-primary border-primary/30',
    Pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    'Not Set': 'bg-muted text-muted-foreground border-border',
  };
  return <span className={`text-[8px] font-medium rounded px-1.5 py-0.5 border ${map[status]}`}>{status}</span>;
};

const VolumeTablePreview = () => (
  <div className="rounded-lg border border-border bg-card overflow-hidden mt-1">
    <table className="w-full text-[9px] leading-tight">
      <thead>
        <tr className="border-b border-border bg-muted/60">
          <th className="px-1.5 py-1 text-left font-semibold text-foreground/80">Department</th>
          <th className="px-1.5 py-1 text-right font-semibold text-foreground/80">Target Vol</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Override Vol</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Expiration</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Status</th>
        </tr>
      </thead>
      <tbody>
        {VOL_ROWS.map(r => (
          <tr key={r.dept} className="border-b border-border/30">
            <td className="px-1.5 py-1 font-medium text-foreground/80">{r.dept}</td>
            <td className="px-1.5 py-1 text-right font-mono text-foreground/70">{r.target.toFixed(1)}</td>
            <td className="px-1.5 py-1 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className={`text-[7px] font-medium rounded px-1 py-0.5 ${r.mandatory ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                  {r.mandatory ? 'Mandatory' : 'Optional'}
                </span>
                <span className="font-mono text-foreground/70">{r.override != null ? r.override.toFixed(1) : '—'}</span>
              </div>
            </td>
            <td className="px-1.5 py-1 text-center text-muted-foreground">{r.expiry ?? '—'}</td>
            <td className="px-1.5 py-1 text-center">{volStatusBadge(r.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const VolumeTargetPreview = () => {
  const months = [14, 18, 22, 20, 16, 24, 21, 19, 15, 23, 17, 13];
  const maxVal = Math.max(...months);
  // 3 lowest indices
  const sorted = [...months].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const lowestIdx = new Set(sorted.slice(0, 3).map(x => x.i));

  return (
    <div className="rounded-lg border border-border bg-card p-2.5 space-y-2 mt-1">
      <div className="flex gap-3">
        <div className="flex-1 rounded bg-muted/50 px-2 py-1.5 text-center">
          <div className="text-[8px] text-muted-foreground uppercase">3M Low Avg</div>
          <div className="text-xs font-bold text-foreground/80">18.5</div>
        </div>
        <div className="flex-1 rounded bg-muted/50 px-2 py-1.5 text-center">
          <div className="text-[8px] text-muted-foreground uppercase">12M Avg</div>
          <div className="text-xs font-bold text-foreground/80">21.2</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-foreground/80 font-medium">Spread: 12.7%</span>
        <span className="text-[9px] text-emerald-600">✓</span>
        <span className="text-[8px] text-muted-foreground">(within 15%)</span>
      </div>
      {/* Mini bar chart */}
      <div className="flex items-end gap-[3px] h-8">
        {months.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-sm ${lowestIdx.has(i) ? 'bg-primary' : 'bg-muted-foreground/25'}`}
            style={{ height: `${(v / maxVal) * 100}%` }}
          />
        ))}
      </div>
      <p className="text-[8px] text-muted-foreground italic">Using 3M Low (spread within 15% threshold)</p>
    </div>
  );
};

/* ─── NP Previews ─── */

const NPStatsPreview = () => (
  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 mt-1">
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <span className="text-[10px] font-semibold text-foreground/80">3</span>
      <span className="text-[9px] text-muted-foreground">Active</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-amber-500" />
      <span className="text-[10px] font-semibold text-foreground/80">1</span>
      <span className="text-[9px] text-muted-foreground">Expiring Soon</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
      <span className="text-[10px] font-semibold text-foreground/80">4</span>
      <span className="text-[9px] text-muted-foreground">Not Set</span>
    </div>
  </div>
);

const NP_ROWS = [
  { dept: 'Cardiac Care', target: '10%', override: '12%', maxExpiry: 'Jun 30, 2026', expiry: 'Mar 15, 2026', status: 'Active' },
  { dept: 'Adult ECMO 001', target: '10%', override: '—', maxExpiry: 'Jun 30, 2026', expiry: '—', status: 'Not Set' },
  { dept: 'Cardiac Crit Care', target: '10%', override: '8%', maxExpiry: 'Jun 30, 2026', expiry: 'Pending...', status: 'Pending' },
];

const NPTablePreview = () => (
  <div className="rounded-lg border border-border bg-card overflow-hidden mt-1">
    <table className="w-full text-[9px] leading-tight">
      <thead>
        <tr className="border-b border-border bg-muted/60">
          <th className="px-1.5 py-1 text-left font-semibold text-foreground/80">Department</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Target NP%</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Override NP%</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Max Expiry</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Expiration</th>
          <th className="px-1.5 py-1 text-center font-semibold text-foreground/80">Status</th>
        </tr>
      </thead>
      <tbody>
        {NP_ROWS.map(r => (
          <tr key={r.dept} className="border-b border-border/30">
            <td className="px-1.5 py-1 font-medium text-foreground/80">{r.dept}</td>
            <td className="px-1.5 py-1 text-center font-mono text-foreground/70">{r.target}</td>
            <td className="px-1.5 py-1 text-center font-mono text-foreground/70">{r.override}</td>
            <td className="px-1.5 py-1 text-center text-muted-foreground">{r.maxExpiry}</td>
            <td className="px-1.5 py-1 text-center text-muted-foreground">{r.expiry}</td>
            <td className="px-1.5 py-1 text-center">{volStatusBadge(r.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const NPTwoStepPreview = () => (
  <div className="rounded-lg border border-border bg-card p-2.5 space-y-2.5 mt-1">
    {/* Step 1 */}
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[9px] font-bold shrink-0">1</div>
      <div className="flex-1 flex items-center gap-1.5">
        <span className="text-[9px] text-foreground/80 font-medium">Enter Override NP%</span>
        <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[9px] font-mono text-foreground/70">12%</div>
        <span className="text-[9px] text-muted-foreground">→</span>
        <span className="text-[8px] font-medium rounded px-1.5 py-0.5 border bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</span>
      </div>
    </div>
    <div className="ml-2.5 w-px h-3 bg-border" />
    {/* Step 2 */}
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[9px] font-bold shrink-0">2</div>
      <div className="flex-1 flex items-center gap-1.5">
        <span className="text-[9px] text-foreground/80 font-medium">Select Expiration</span>
        <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[9px] font-mono text-foreground/70">Mar 15</div>
        <span className="text-[9px] text-muted-foreground">→</span>
        <span className="text-[8px] font-medium rounded px-1.5 py-0.5 border bg-primary/10 text-primary border-primary/30">Active</span>
      </div>
    </div>
    <div className="ml-2.5 w-px h-3 bg-border" />
    {/* Revert */}
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive/15 text-destructive text-[9px] shrink-0">↺</div>
      <span className="text-[9px] text-foreground/80 font-medium">Revert</span>
      <span className="text-[8px] text-muted-foreground">— clears both values</span>
    </div>
  </div>
);

export function SettingsDemoPreview({ variant }: SettingsDemoPreviewProps) {
  switch (variant) {
    case 'volume-stats-preview':
      return <VolumeStatsPreview />;
    case 'volume-table-preview':
      return <VolumeTablePreview />;
    case 'volume-target-preview':
      return <VolumeTargetPreview />;
    case 'np-stats-preview':
      return <NPStatsPreview />;
    case 'np-table-preview':
      return <NPTablePreview />;
    case 'np-two-step-preview':
      return <NPTwoStepPreview />;
    default:
      return null;
  }
}
