import { useState } from 'react';

type PlanningDemoVariant =
  | 'planning-table-preview'
  | 'toggle-comparison'
  | 'planning-groups'
  | 'planning-actions';

interface PlanningDemoPreviewProps {
  variant: PlanningDemoVariant;
  config?: {
    type?: 'hired-active' | 'nursing';
  };
}

// Real data from PositionPlanning.tsx
const TABLE_DATA = [
  { skill: 'CL', tD: 2.4, tN: 2.4, tT: 4.8, hD: 1.8, hN: 1.8, hT: 3.6, rD: 0.6, rN: 0.6, rT: 1.2, vD: 0.0, vN: 0.0, vT: 0.0 },
  { skill: 'RN', tD: 14.3, tN: 14.3, tT: 28.6, hD: 13.8, hN: 13.8, hT: 27.6, rD: 0.0, rN: 0.0, rT: 0.0, vD: -0.5, vN: -0.5, vT: -1.0 },
  { skill: 'PCT', tD: 9.6, tN: 9.6, tT: 19.2, hD: 9.2, hN: 9.2, hT: 18.4, rD: 0.8, rN: 0.8, rT: 1.6, vD: 0.4, vN: 0.4, vT: 0.8 },
];
const TOTAL = { tD: 33.1, tN: 31.1, tT: 64.2, hD: 31.6, hN: 29.6, hT: 61.2, rD: 1.4, rN: 1.4, rT: 2.8, vD: -0.1, vN: -0.1, vT: -0.2 };

const fmtVal = (v: number) => {
  const s = v === 0 ? '0.0' : v.toFixed(1);
  return v < 0 ? s : v === 0 ? s : s;
};

const varCell = (v: number) => (
  <span className={v < 0 ? 'text-orange-600 font-semibold' : v > 0 ? 'text-emerald-600' : 'text-muted-foreground'}>
    {fmtVal(v)}
  </span>
);

const PlanningTablePreview = () => {
  const colGroups = ['Target', 'Hired', 'Reqs', 'Variance'];
  const shifts = ['D', 'N', 'T'];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden mt-1">
      <div className="overflow-x-auto">
        <table className="w-full text-[9px] leading-tight">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className="px-1.5 py-1 text-left font-semibold text-foreground/80 sticky left-0 bg-muted/60" rowSpan={2}>Skills</th>
              {colGroups.map(g => (
                <th key={g} className="px-0.5 py-0.5 text-center font-semibold text-foreground/80 border-l border-border/50" colSpan={3}>{g}</th>
              ))}
            </tr>
            <tr className="border-b border-border bg-muted/40">
              {colGroups.map(g => shifts.map(s => (
                <th key={`${g}-${s}`} className="px-1 py-0.5 text-center font-medium text-muted-foreground border-l border-border/30 w-[28px]">{s}</th>
              )))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {TABLE_DATA.map(r => (
              <tr key={r.skill} className="border-b border-border/30 hover:bg-muted/20">
                <td className="px-1.5 py-1 font-semibold text-foreground/80 sticky left-0 bg-card">{r.skill}</td>
                <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/30">{fmtVal(r.tD)}</td>
                <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/20">{fmtVal(r.tN)}</td>
                <td className="px-1 py-1 text-center font-medium text-foreground/80 border-l border-border/20">{fmtVal(r.tT)}</td>
                <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/30">{fmtVal(r.hD)}</td>
                <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/20">{fmtVal(r.hN)}</td>
                <td className="px-1 py-1 text-center font-medium text-foreground/80 border-l border-border/20">{fmtVal(r.hT)}</td>
                <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/30">{fmtVal(r.rD)}</td>
                <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/20">{fmtVal(r.rN)}</td>
                <td className="px-1 py-1 text-center font-medium text-foreground/80 border-l border-border/20">{fmtVal(r.rT)}</td>
                <td className="px-1 py-1 text-center border-l border-border/30">{varCell(r.vD)}</td>
                <td className="px-1 py-1 text-center border-l border-border/20">{varCell(r.vN)}</td>
                <td className="px-1 py-1 text-center font-medium border-l border-border/20">{varCell(r.vT)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 font-semibold">
              <td className="px-1.5 py-1 text-foreground/80 sticky left-0 bg-muted/50">TOTAL</td>
              <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/30">{fmtVal(TOTAL.tD)}</td>
              <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/20">{fmtVal(TOTAL.tN)}</td>
              <td className="px-1 py-1 text-center text-foreground/80 border-l border-border/20">{fmtVal(TOTAL.tT)}</td>
              <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/30">{fmtVal(TOTAL.hD)}</td>
              <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/20">{fmtVal(TOTAL.hN)}</td>
              <td className="px-1 py-1 text-center text-foreground/80 border-l border-border/20">{fmtVal(TOTAL.hT)}</td>
              <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/30">{fmtVal(TOTAL.rD)}</td>
              <td className="px-1 py-1 text-center text-muted-foreground border-l border-border/20">{fmtVal(TOTAL.rN)}</td>
              <td className="px-1 py-1 text-center text-foreground/80 border-l border-border/20">{fmtVal(TOTAL.rT)}</td>
              <td className="px-1 py-1 text-center border-l border-border/30">{varCell(TOTAL.vD)}</td>
              <td className="px-1 py-1 text-center border-l border-border/20">{varCell(TOTAL.vN)}</td>
              <td className="px-1 py-1 text-center border-l border-border/20">{varCell(TOTAL.vT)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const ToggleComparison = ({ type = 'hired-active' }: { type?: 'hired-active' | 'nursing' }) => {
  if (type === 'hired-active') {
    return (
      <div className="flex gap-2 mt-1">
        <div className="flex-1 rounded-lg border-2 border-primary/50 bg-muted/30 p-2 space-y-1.5">
          <div className="text-[10px] font-bold text-primary">Hired</div>
          <p className="text-[9px] text-muted-foreground leading-snug">All employees including those on leave</p>
          <div className="rounded bg-background/60 px-1.5 py-1 text-[9px] font-mono space-y-0.5">
            <div className="flex justify-between"><span className="text-foreground/70">RN</span><span className="font-semibold text-foreground/80">27.6</span></div>
            <div className="flex justify-between"><span className="text-foreground/70">PCT</span><span className="font-semibold text-foreground/80">18.4</span></div>
          </div>
        </div>
        <div className="flex-1 rounded-lg border-2 border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20 p-2 space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-blue-600">Active</span>
            <span className="text-[8px] bg-blue-500/15 text-blue-600 rounded-full px-1.5 py-0.5 font-medium">adjusted</span>
          </div>
          <p className="text-[9px] text-muted-foreground leading-snug">Currently available staff</p>
          <div className="rounded bg-background/60 px-1.5 py-1 text-[9px] font-mono space-y-0.5">
            <div className="flex justify-between"><span className="text-foreground/70">RN</span><span className="font-semibold text-blue-600">26.6</span></div>
            <div className="flex justify-between"><span className="text-foreground/70">PCT</span><span className="font-semibold text-blue-600">17.4</span></div>
          </div>
        </div>
      </div>
    );
  }

  // nursing comparison
  return (
    <div className="flex gap-2 mt-1">
      <div className="flex-1 rounded-lg border-2 border-primary/50 bg-muted/30 p-2 space-y-1.5">
        <div className="text-[10px] font-bold text-primary">Nursing</div>
        <p className="text-[9px] text-muted-foreground leading-snug">Clinical departments with full staffing analysis</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {['Target', 'Hired', 'Reqs', 'Variance'].map(col => (
            <span key={col} className="text-[8px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">{col}</span>
          ))}
        </div>
      </div>
      <div className="flex-1 rounded-lg border-2 border-orange-500/50 bg-orange-50/30 dark:bg-orange-950/20 p-2 space-y-1.5">
        <div className="text-[10px] font-bold text-orange-600">Non-Nursing</div>
        <p className="text-[9px] text-muted-foreground leading-snug">Support departments — no target or variance</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {['Hired', 'Reqs'].map(col => (
            <span key={col} className="text-[8px] bg-orange-500/10 text-orange-600 rounded px-1.5 py-0.5 font-medium">{col}</span>
          ))}
          {['Target', 'Variance'].map(col => (
            <span key={col} className="text-[8px] bg-muted/50 text-muted-foreground/40 rounded px-1.5 py-0.5 font-medium line-through">{col}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlanningGroups = () => {
  const [expanded, setExpanded] = useState(true);

  const groups = [
    {
      name: 'Overheads',
      total: 2.0,
      children: [
        { name: 'Director', fte: 0.0 },
        { name: 'Manager', fte: 1.0 },
        { name: 'Asst Manager', fte: 1.0 },
      ],
    },
    { name: 'Clinical Staff', total: 31.2, children: null },
    { name: 'Support Staff', total: 28.0, children: null },
  ];

  return (
    <div className="rounded-lg border border-border bg-muted/50 overflow-hidden text-xs mt-1">
      {groups.map((g, i) => {
        const isExpanded = i === 0 && expanded;
        const isCollapsed = i !== 0 || !expanded;
        return (
          <div key={g.name}>
            <button
              type="button"
              onClick={() => i === 0 && setExpanded(!expanded)}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted/80 font-medium text-foreground/80 border-b border-border/50 w-full text-left hover:bg-muted transition-colors"
            >
              <span className="text-[10px] text-muted-foreground">{isCollapsed ? '▶' : '▼'}</span>
              <span>{g.name}</span>
              <span className="ml-auto font-mono text-muted-foreground">{g.total.toFixed(1)}</span>
            </button>
            {isExpanded && g.children && (
              <div className="divide-y divide-border/30">
                {g.children.map(c => (
                  <div key={c.name} className="flex items-center gap-2 px-6 py-1 text-foreground/70">
                    <span>{c.name}</span>
                    <span className="ml-auto font-mono text-muted-foreground">{c.fte.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 font-semibold text-foreground/80 border-t border-border">
        <span>TOTAL</span>
        <span className="ml-auto font-mono">61.2</span>
      </div>
    </div>
  );
};

const PlanningActions = () => (
  <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-3 mt-1">
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-foreground">Refresh Data</div>
        <div className="text-[10px] text-muted-foreground leading-snug">Reload the latest staffing data from the database.</div>
      </div>
    </div>
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-foreground">Download CSV</div>
        <div className="text-[10px] text-muted-foreground leading-snug">Export the full table as a spreadsheet file.</div>
      </div>
    </div>
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-foreground">Full-Screen View</div>
        <div className="text-[10px] text-muted-foreground leading-snug">Open the table in a full-screen dialog for easier analysis.</div>
      </div>
    </div>
  </div>
);

export function PlanningDemoPreview({ variant, config }: PlanningDemoPreviewProps) {
  switch (variant) {
    case 'planning-table-preview':
      return <PlanningTablePreview />;
    case 'toggle-comparison':
      return <ToggleComparison type={config?.type} />;
    case 'planning-groups':
      return <PlanningGroups />;
    case 'planning-actions':
      return <PlanningActions />;
    default:
      return null;
  }
}
