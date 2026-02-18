import { createElement } from 'react';

type TourDemoVariant =
  | 'mini-chart'
  | 'kpi-info'
  | 'volume-colors'
  | 'split-badge'
  | 'tab-pills'
  | 'legend'
  | 'expandable-row'
  | 'forecast-cards'
  | 'toggle-pair';

interface TourDemoPreviewProps {
  variant: TourDemoVariant;
  /** For split-badge: 'green' | 'orange'. For toggle-pair: labels [active, inactive]. */
  config?: {
    color?: 'green' | 'orange';
    labels?: [string, string];
    definition?: string;
    formula?: string;
  };
}

const MiniChart = () => (
  <div className="rounded-lg border border-border bg-muted/50 p-3">
    <svg viewBox="0 0 120 36" className="w-full h-10" aria-hidden="true">
      <polyline
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="4,28 24,14 44,24 64,8 84,18 104,12"
      />
      {[
        [4, 28], [24, 14], [44, 24], [64, 8], [84, 18], [104, 12],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="hsl(var(--primary))" />
      ))}
    </svg>
    <div className="flex justify-between text-[10px] mt-1.5 text-muted-foreground font-medium">
      <span>High: 98.2</span>
      <span>Avg: 85.4</span>
      <span>Low: 72.1</span>
    </div>
  </div>
);

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

export function TourDemoPreview({ variant, config }: TourDemoPreviewProps) {
  switch (variant) {
    case 'mini-chart':
      return <MiniChart />;
    case 'kpi-info':
      return <KPIInfo definition={config?.definition} formula={config?.formula} />;
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
