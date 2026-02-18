import { useState } from 'react';

type VarianceDemoVariant =
  | 'variance-table-preview'
  | 'variance-skill-columns'
  | 'variance-groups';

interface VarianceDemoPreviewProps {
  variant: VarianceDemoVariant;
}

const fmtVar = (v: number) => {
  const s = v.toFixed(1);
  return v > 0 ? `+${s}` : s;
};

const varCell = (v: number) => (
  <span className={v < 0 ? 'text-orange-600 font-semibold' : v > 0 ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}>
    {fmtVar(v)}
  </span>
);

// Sample variance data by region across skill types
const VARIANCE_DATA = [
  { region: 'Region 1', cl: [1.2, 0.8, 2.0], rn: [-2.1, -1.5, -3.6], pct: [0.5, 0.3, 0.8], huc: [0.4, 0.2, 0.6], oh: [0.0, 0.0, 0.0] },
  { region: 'Region 2', cl: [-0.4, 0.2, -0.2], rn: [1.3, 0.9, 2.2], pct: [-0.8, -0.4, -1.2], huc: [0.0, -0.2, -0.2], oh: [0.2, 0.0, 0.2] },
  { region: 'Region 3', cl: [0.6, 0.0, 0.6], rn: [-0.4, 0.2, -0.2], pct: [0.8, 0.4, 1.2], huc: [0.2, 0.0, 0.2], oh: [-0.2, 0.0, -0.2] },
];

const TOTAL = { cl: [1.4, 1.0, 2.4], rn: [-1.2, -0.4, -1.6], pct: [0.5, 0.3, 0.8], huc: [0.6, 0.0, 0.6], oh: [0.0, 0.0, 0.0] };

const SKILLS = ['CL', 'RN', 'PCT', 'HUC', 'OH'] as const;
const SHIFTS = ['D', 'N', 'T'] as const;

const VarianceTablePreview = () => (
  <div className="rounded-lg border border-border bg-card overflow-hidden mt-1">
    <div className="overflow-x-auto">
      <table className="w-full text-[9px] leading-tight">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="px-1.5 py-1 text-left font-semibold text-foreground/80 sticky left-0 bg-muted/60" rowSpan={2}>Regions</th>
            {SKILLS.map(s => (
              <th key={s} className="px-0.5 py-0.5 text-center font-semibold text-foreground/80 border-l border-border/50" colSpan={3}>{s}</th>
            ))}
          </tr>
          <tr className="border-b border-border bg-muted/40">
            {SKILLS.map(sk => SHIFTS.map(sh => (
              <th key={`${sk}-${sh}`} className="px-1 py-0.5 text-center font-medium text-muted-foreground border-l border-border/30 w-[24px]">{sh}</th>
            )))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {VARIANCE_DATA.map(r => {
            const vals = [r.cl, r.rn, r.pct, r.huc, r.oh];
            return (
              <tr key={r.region} className="border-b border-border/30 hover:bg-muted/20">
                <td className="px-1.5 py-1 font-semibold text-foreground/80 sticky left-0 bg-card whitespace-nowrap">{r.region}</td>
                {vals.map((arr, si) => arr.map((v, shi) => (
                  <td key={`${si}-${shi}`} className="px-0.5 py-1 text-center border-l border-border/30">{varCell(v)}</td>
                )))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-muted/50 font-semibold">
            <td className="px-1.5 py-1 text-foreground/80 sticky left-0 bg-muted/50">TOTAL</td>
            {[TOTAL.cl, TOTAL.rn, TOTAL.pct, TOTAL.huc, TOTAL.oh].map((arr, si) => arr.map((v, shi) => (
              <td key={`t-${si}-${shi}`} className="px-0.5 py-1 text-center border-l border-border/30">{varCell(v)}</td>
            )))}
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

const SKILL_INFO = [
  { abbr: 'CL', full: 'Clinical Lead', color: 'bg-primary/10 text-primary' },
  { abbr: 'RN', full: 'Registered Nurse', color: 'bg-blue-500/10 text-blue-600' },
  { abbr: 'PCT', full: 'Patient Care Tech', color: 'bg-emerald-500/10 text-emerald-600' },
  { abbr: 'HUC', full: 'Health Unit Coord', color: 'bg-amber-500/10 text-amber-600' },
  { abbr: 'OH', full: 'Overhead', color: 'bg-muted text-muted-foreground' },
];

const VarianceSkillColumns = () => (
  <div className="space-y-1.5 mt-1">
    {SKILL_INFO.map(sk => (
      <div key={sk.abbr} className="rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 flex items-center gap-2">
        <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 ${sk.color}`}>{sk.abbr}</span>
        <span className="text-[10px] text-foreground/80 font-medium">{sk.full}</span>
        <div className="ml-auto flex gap-1">
          {SHIFTS.map(s => (
            <span key={s} className="text-[8px] bg-background/60 text-muted-foreground rounded px-1 py-0.5 font-mono">{s}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const VarianceGroups = () => {
  const [expanded, setExpanded] = useState(true);

  const groups = [
    {
      name: 'Region 1',
      total: 2.4,
      children: [
        { name: 'Baltimore', val: 1.2 },
        { name: 'Florida', val: 1.2 },
      ],
    },
    { name: 'Region 2', total: -1.8, children: null },
    { name: 'Region 3', total: 0.6, children: null },
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
              <span className={`ml-auto font-mono ${g.total < 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {fmtVar(g.total)}
              </span>
            </button>
            {isExpanded && g.children && (
              <div className="divide-y divide-border/30">
                {g.children.map(c => (
                  <div key={c.name} className="flex items-center gap-2 px-6 py-1 text-foreground/70">
                    <span>{c.name}</span>
                    <span className={`ml-auto font-mono ${c.val < 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {fmtVar(c.val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 font-semibold text-foreground/80 border-t border-border">
        <span>TOTAL</span>
        <span className="ml-auto font-mono text-emerald-600">+1.2</span>
      </div>
    </div>
  );
};

export function VarianceDemoPreview({ variant }: VarianceDemoPreviewProps) {
  switch (variant) {
    case 'variance-table-preview':
      return <VarianceTablePreview />;
    case 'variance-skill-columns':
      return <VarianceSkillColumns />;
    case 'variance-groups':
      return <VarianceGroups />;
    default:
      return null;
  }
}
