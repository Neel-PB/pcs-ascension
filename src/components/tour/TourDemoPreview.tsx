import { createElement } from 'react';
import { getFTEKPIs, getVolumeKPIs, getProductivityKPIs, type KPIConfig } from '@/config/kpiConfigs';

type TourDemoVariant =
  | 'kpi-compact'
  | 'volume-colors'
  | 'split-badge'
  | 'legend'
  | 'target-vol-preview'
  | 'override-vol-preview';

interface TourDemoPreviewProps {
  variant: TourDemoVariant;
  config?: {
    color?: 'green' | 'orange';
    labels?: [string, string];
    definition?: string;
    formula?: string;
    hasChart?: boolean;
    kpiId?: string;
  };
}

const findKpiConfig = (kpiId: string): KPIConfig | undefined => {
  const all = [...getFTEKPIs(), ...getVolumeKPIs(), ...getProductivityKPIs()];
  return all.find(k => k.id === kpiId);
};

const KPICompactPreview = ({ kpiId }: { kpiId: string }) => {
  const kpi = findKpiConfig(kpiId);
  if (!kpi) return null;

  const data = kpi.chartData.slice(-12).map(d => d.value);
  const high = Math.max(...data);
  const avg = Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 10) / 10;
  const low = Math.min(...data);

  const chartL = 4, chartR = 196, chartT = 4, chartB = 52;
  const yMin = Math.min(...data) - (Math.max(...data) - Math.min(...data)) * 0.2;
  const yMax = Math.max(...data) + (Math.max(...data) - Math.min(...data)) * 0.2;
  const toX = (i: number) => chartL + (i / (data.length - 1)) * (chartR - chartL);
  const toY = (v: number) => chartB - ((v - yMin) / (yMax - yMin)) * (chartB - chartT);
  const points = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const areaPath = `M${toX(0).toFixed(1)},${toY(data[0]).toFixed(1)} ${data.slice(1).map((v, i) => `L${toX(i + 1).toFixed(1)},${toY(v).toFixed(1)}`).join(" ")} L${toX(data.length - 1).toFixed(1)},${chartB} L${toX(0).toFixed(1)},${chartB} Z`;

  // Get first line of calculation only
  const calcFirstLine = kpi.calculation.split('\n')[0];

  return (
    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
      {/* Left: Chart */}
      <div className="rounded border border-border bg-background/50 p-2 space-y-1">
        <div className="text-[9px] font-semibold text-foreground/60 uppercase tracking-wider">Trend</div>
        <svg viewBox="0 0 200 56" className="w-full h-12" aria-hidden="true">
          <defs>
            <linearGradient id={`kpiGrad-${kpiId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#kpiGrad-${kpiId})`} />
          <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
          {data.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r="1.5" fill="hsl(var(--primary))" />
          ))}
        </svg>
        <div className="grid grid-cols-3 gap-1 text-center border-t border-border/50 pt-1">
          <div><div className="text-[8px] text-muted-foreground">High</div><div className="text-[10px] font-semibold">{high.toFixed(1)}</div></div>
          <div><div className="text-[8px] text-muted-foreground">Avg</div><div className="text-[10px] font-semibold">{avg.toFixed(1)}</div></div>
          <div><div className="text-[8px] text-muted-foreground">Low</div><div className="text-[10px] font-semibold">{low.toFixed(1)}</div></div>
        </div>
      </div>
      {/* Right: Definition + Calculation */}
      <div className="rounded border border-border bg-background/50 p-2 space-y-1.5">
        <div>
          <div className="text-[9px] font-semibold text-foreground/60 uppercase tracking-wider">Definition</div>
          <p className="text-[10px] text-foreground/70 leading-snug mt-0.5">{kpi.definition}</p>
        </div>
        <div className="border-t border-border/50 pt-1">
          <div className="text-[9px] font-semibold text-foreground/60 uppercase tracking-wider">Calculation</div>
          <p className="text-[10px] font-mono text-foreground/70 leading-snug bg-muted/50 rounded px-1.5 py-0.5 mt-0.5">{calcFirstLine}</p>
        </div>
      </div>
    </div>
  );
};

const VolumeColors = () => (
  <div className="flex gap-2">
    <div className="flex-1 rounded-lg border-2 border-emerald-500 bg-muted/50 p-2 text-center">
      <div className="text-[10px] font-semibold text-emerald-600">Target</div>
      <div className="text-xs text-muted-foreground">(active)</div>
    </div>
    <div className="flex-1 rounded-lg border-2 border-orange-500 bg-muted/50 p-2 text-center">
      <div className="text-[10px] font-semibold text-orange-600">Override</div>
      <div className="text-xs text-muted-foreground">(active)</div>
    </div>
  </div>
);

const SplitBadge = ({ color = 'green' }: { color?: 'green' | 'orange' }) => {
  const bg = color === 'green' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-orange-500/15 text-orange-700';
  return (
    <div className="flex justify-center">
      <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${bg}`}>
        <span>70% FT</span>
        <span className="text-muted-foreground/50">·</span>
        <span>20% PT</span>
        <span className="text-muted-foreground/50">·</span>
        <span>10% PRN</span>
      </div>
    </div>
  );
};

const Legend = () => (
  <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1.5">
    <div className="flex items-center gap-2 text-xs">
      <div className="h-3 w-3 rounded-sm bg-emerald-500" />
      <span className="text-emerald-700 font-medium">+2.0</span>
      <span className="text-muted-foreground">Surplus</span>
    </div>
    <div className="flex items-center gap-2 text-xs">
      <div className="h-3 w-3 rounded-sm bg-orange-500" />
      <span className="text-orange-700 font-medium">−3.5</span>
      <span className="text-muted-foreground">Shortage</span>
    </div>
  </div>
);

const TargetVolPreview = () => (
  <div className="mt-2 space-y-1.5">
    <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-2.5 pr-8 relative border-l-[3px] border-l-emerald-500">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Target Vol</p>
      <p className="text-lg font-semibold text-foreground mt-0.5">20.8</p>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 opacity-40">
        <div className="p-1"><div className="h-3.5 w-3.5 rounded-sm border border-muted-foreground/40" /></div>
        <div className="p-1"><div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" /></div>
      </div>
      <div className="mt-1.5">
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[10px] font-medium">
          12-Mo Avg
        </span>
      </div>
    </div>
    <p className="text-[10px] text-muted-foreground/70 italic text-center">
      Green border = system-calculated target is active
    </p>
  </div>
);

const OverrideVolPreview = () => (
  <div className="mt-2 space-y-1.5">
    <div className="rounded-md border border-orange-500/40 bg-orange-500/5 p-2.5 pr-8 relative border-l-[3px] border-l-orange-500">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Override Vol</p>
      <p className="text-lg font-semibold text-foreground mt-0.5">24.7</p>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 opacity-40">
        <div className="p-1"><div className="h-3.5 w-3.5 rounded-sm border border-muted-foreground/40" /></div>
        <div className="p-1"><div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" /></div>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="inline-flex items-center rounded-full bg-orange-500/15 text-orange-700 px-2 py-0.5 text-[10px] font-medium">
          Manual
        </span>
        <span className="text-[10px] text-muted-foreground">Expires: Mar 15, 2026</span>
      </div>
    </div>
    <p className="text-[10px] text-muted-foreground/70 italic text-center">
      Orange border = manual override is active
    </p>
  </div>
);


export function TourDemoPreview({ variant, config }: TourDemoPreviewProps) {
  switch (variant) {
    case 'kpi-compact':
      return <KPICompactPreview kpiId={config?.kpiId || ''} />;
    case 'volume-colors':
      return <VolumeColors />;
    case 'split-badge':
      return <SplitBadge color={config?.color} />;
    case 'legend':
      return <Legend />;
    case 'target-vol-preview':
      return <TargetVolPreview />;
    case 'override-vol-preview':
      return <OverrideVolPreview />;
    default:
      return null;
  }
}
