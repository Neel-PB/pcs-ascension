import { createElement } from 'react';
import { getFTEKPIs, getVolumeKPIs, getProductivityKPIs, type KPIConfig } from '@/config/kpiConfigs';

type TourDemoVariant =
  | 'mini-chart'
  | 'kpi-info'
  | 'kpi-actions'
  | 'kpi-compact'
  | 'volume-colors'
  | 'split-badge'
  | 'tab-pills'
  | 'legend'
  | 'expandable-row'
  | 'forecast-cards'
  | 'toggle-pair';

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

const MiniChart = () => {
  // Realistic data points hovering around 565–634 range
  const data = [588, 601, 612, 595, 620, 634, 608, 615, 599, 565, 610, 622];
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const high = Math.max(...data);
  const avg = Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 10) / 10;
  const low = Math.min(...data);

  // Chart area: viewBox 0 0 220 90, chart region x:28..212, y:4..72
  const chartL = 28, chartR = 212, chartT = 4, chartB = 72;
  const yMin = 0, yMax = 800;
  const toX = (i: number) => chartL + (i / (data.length - 1)) * (chartR - chartL);
  const toY = (v: number) => chartB - ((v - yMin) / (yMax - yMin)) * (chartB - chartT);

  const points = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const areaPath = `M${toX(0).toFixed(1)},${toY(data[0]).toFixed(1)} ${data.slice(1).map((v, i) => `L${toX(i + 1).toFixed(1)},${toY(v).toFixed(1)}`).join(" ")} L${toX(data.length - 1).toFixed(1)},${chartB} L${toX(0).toFixed(1)},${chartB} Z`;
  const yTicks = [0, 200, 400, 600, 800];

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-foreground">12M Average</span>
        <div className="text-right">
          <div className="text-[9px] text-muted-foreground">Current Value</div>
          <div className="text-base font-bold text-foreground leading-tight">633.5</div>
        </div>
      </div>

      {/* Tab indicators */}
      <div className="flex gap-3 border-b border-border pb-1">
        <span className="text-[10px] font-semibold text-primary border-b-2 border-primary pb-0.5">Chart</span>
        <span className="text-[10px] text-muted-foreground pb-0.5">Table</span>
      </div>

      {/* SVG Area Chart */}
      <svg viewBox="0 0 220 90" className="w-full h-28" aria-hidden="true">
        <defs>
          <linearGradient id="miniAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Y-axis gridlines + labels */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={chartL} x2={chartR} y1={toY(tick)} y2={toY(tick)} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x={chartL - 3} y={toY(tick) + 1.5} textAnchor="end" className="fill-muted-foreground" fontSize="5" fontFamily="inherit">{tick}</text>
          </g>
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#miniAreaGrad)" />
        {/* Line */}
        <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {/* Dots */}
        {data.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="2" fill="hsl(var(--primary))" />
        ))}
        {/* X-axis month labels */}
        {months.map((m, i) => (
          <text key={m} x={toX(i)} y={chartB + 8} textAnchor="middle" className="fill-muted-foreground" fontSize="4.5" fontFamily="inherit">{m}</text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
        <div className="w-3 h-[2px] rounded bg-primary" />
        <span>12M Average</span>
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-3 gap-2 border-t border-border pt-2 text-center">
        <div>
          <div className="text-[9px] text-muted-foreground">High</div>
          <div className="text-xs font-semibold text-foreground">{high.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground">Average</div>
          <div className="text-xs font-semibold text-foreground">{avg.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground">Low</div>
          <div className="text-xs font-semibold text-foreground">{low.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};

const KPIInfo = ({ definition, formula }: { definition?: string; formula?: string }) => (
  <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
    <div>
      <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider">Definition</span>
      <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">
        {definition || 'Percentage of approved positions currently unfilled.'}
      </p>
    </div>
    <div className="border-t border-border/50 pt-2">
      <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider">Calculation</span>
      <p className="text-xs font-mono text-foreground/80 mt-0.5 bg-background/50 rounded px-2 py-1">
        {formula || '(Target FTEs − Hired FTEs) / Target FTEs × 100'}
      </p>
    </div>
  </div>
);

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

const TabPills = () => {
  const tabs = ['Summary', 'Planning', 'Variance', 'Forecasts', 'Settings'];
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1.5">
      {tabs.map((tab, i) => (
        <div
          key={tab}
          className={`rounded-md px-2 py-1 text-[10px] font-medium ${
            i === 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          {tab}
        </div>
      ))}
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

const ExpandableRow = () => (
  <div className="rounded-lg border border-border bg-muted/50 overflow-hidden text-xs">
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/80 font-medium text-foreground/80 border-b border-border/50">
      <span className="text-[10px]">▼</span>
      <span>Clinical Staff</span>
      <span className="ml-auto text-muted-foreground font-mono">12.5</span>
    </div>
    <div className="divide-y divide-border/30">
      <div className="flex items-center gap-2 px-6 py-1 text-foreground/70">
        <span>RN – Day</span>
        <span className="ml-auto font-mono text-muted-foreground">8.0</span>
      </div>
      <div className="flex items-center gap-2 px-6 py-1 text-foreground/70">
        <span>RN – Night</span>
        <span className="ml-auto font-mono text-muted-foreground">4.5</span>
      </div>
    </div>
  </div>
);

const ForecastCards = () => (
  <div className="flex gap-2">
    <div className="flex-1 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/20 p-2 text-center">
      <div className="text-[10px] font-semibold text-orange-600">Shortage</div>
      <div className="text-sm font-bold text-orange-700">+5.0</div>
    </div>
    <div className="flex-1 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/20 p-2 text-center">
      <div className="text-[10px] font-semibold text-blue-600">Surplus</div>
      <div className="text-sm font-bold text-blue-700">−3.2</div>
    </div>
  </div>
);

const TogglePair = ({ labels = ['Hired', 'Active'] }: { labels?: [string, string] }) => (
  <div className="flex items-center rounded-full border-2 border-primary bg-muted/50 p-0.5">
    <div className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] font-medium">
      {labels[0]}
    </div>
    <div className="rounded-full px-3 py-1 text-[10px] font-medium text-muted-foreground">
      {labels[1]}
    </div>
  </div>
);

const CompactMiniChart = () => {
  const data = [588, 601, 612, 595, 620, 634, 608, 615, 599, 565, 610, 622];
  const chartL = 4, chartR = 196, chartT = 4, chartB = 44;
  const yMin = 540, yMax = 660;
  const toX = (i: number) => chartL + (i / (data.length - 1)) * (chartR - chartL);
  const toY = (v: number) => chartB - ((v - yMin) / (yMax - yMin)) * (chartB - chartT);
  const points = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const areaPath = `M${toX(0).toFixed(1)},${toY(data[0]).toFixed(1)} ${data.slice(1).map((v, i) => `L${toX(i + 1).toFixed(1)},${toY(v).toFixed(1)}`).join(" ")} L${toX(data.length - 1).toFixed(1)},${chartB} L${toX(0).toFixed(1)},${chartB} Z`;

  return (
    <div className="rounded border border-border bg-background/50 p-1.5 mt-1.5">
      <svg viewBox="0 0 200 48" className="w-full h-12" aria-hidden="true">
        <defs>
          <linearGradient id="compactAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#compactAreaGrad)" />
        <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="1.5" fill="hsl(var(--primary))" />
        ))}
      </svg>
    </div>
  );
};

const CompactDefinition = () => (
  <div className="rounded border border-border bg-background/50 p-2 mt-1.5 space-y-1.5">
    <div>
      <span className="text-[9px] font-semibold text-foreground/60 uppercase tracking-wider">Definition</span>
      <p className="text-[10px] text-foreground/70 leading-snug">Percentage of approved positions currently unfilled.</p>
    </div>
    <div className="border-t border-border/50 pt-1">
      <span className="text-[9px] font-semibold text-foreground/60 uppercase tracking-wider">Calculation</span>
      <p className="text-[10px] font-mono text-foreground/70 leading-snug bg-muted/50 rounded px-1.5 py-0.5 mt-0.5">(Target − Hired) / Target × 100</p>
    </div>
  </div>
);

const KPIActions = ({ hasChart = true }: { hasChart?: boolean }) => (
  <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-3 mt-1">
    {hasChart && (
      <div className="flex gap-2.5">
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="currentColor"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>
          </div>
          <div className="w-px flex-1 bg-border mt-1" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground">Trend Chart</div>
          <div className="text-[10px] text-muted-foreground leading-snug">View 12-month historical trends and breakdowns.</div>
          <CompactMiniChart />
        </div>
      </div>
    )}
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-foreground">Definition</div>
        <div className="text-[10px] text-muted-foreground leading-snug">See the formula and how this metric is calculated.</div>
        <CompactDefinition />
      </div>
    </div>
  </div>
);

export function TourDemoPreview({ variant, config }: TourDemoPreviewProps) {
  switch (variant) {
    case 'mini-chart':
      return <MiniChart />;
    case 'kpi-info':
      return <KPIInfo definition={config?.definition} formula={config?.formula} />;
    case 'kpi-actions':
      return <KPIActions hasChart={config?.hasChart} />;
    case 'kpi-compact':
      return <KPICompactPreview kpiId={config?.kpiId || ''} />;
    case 'volume-colors':
      return <VolumeColors />;
    case 'split-badge':
      return <SplitBadge color={config?.color} />;
    case 'tab-pills':
      return <TabPills />;
    case 'legend':
      return <Legend />;
    case 'expandable-row':
      return <ExpandableRow />;
    case 'forecast-cards':
      return <ForecastCards />;
    case 'toggle-pair':
      return <TogglePair labels={config?.labels} />;
    default:
      return null;
  }
}
