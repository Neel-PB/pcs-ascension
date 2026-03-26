import { useState } from 'react';
import { KPICard, EmploymentBreakdown } from './KPICard';
import { Info, GripVertical } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface KPIData {
  id: string;
  title: string;
  value: string;
  chartData: any[];
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'radial';
  delay: number;
  definition: string;
  calculation: string;
  isNegative?: boolean;
  isHighlighted?: boolean;
  useVacancyModal?: boolean;
  vacancyData?: any[];
  employmentBreakdown?: EmploymentBreakdown;
  breakdownVariant?: 'green' | 'red' | 'orange';
}

interface DragHandleProps {
  attributes: any;
  listeners: any;
}

interface DraggableKPISectionProps {
  title: string;
  kpis: KPIData[];
  dragHandleProps?: DragHandleProps;
  volumeBreakdown?: Array<{ label: string; value: number }>;
}

// Only Hired FTEs and Open Reqs get rounded-b-none (not FTE Variance)
const BREAKDOWN_CONNECTED_IDS = ['hired-ftes', 'open-reqs'];

const xlGridColsMap: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
};

export function DraggableKPISection({ title, kpis, dragHandleProps, volumeBreakdown }: DraggableKPISectionProps) {
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showTargetBreakdownModal, setShowTargetBreakdownModal] = useState(false);
  const [showVolumeBreakdownModal, setShowVolumeBreakdownModal] = useState(false);

  const colCount = Math.min(kpis.length, 6);
  const xlGridCols = xlGridColsMap[colCount] || 'xl:grid-cols-6';

  // Get the shared breakdown from hired-ftes
  const hiredFtesKpi = kpis.find(k => k.id === 'hired-ftes');
  const sharedBreakdown = hiredFtesKpi?.employmentBreakdown;
  const breakdownVariant = hiredFtesKpi?.breakdownVariant || 'red';

  // Get target-ftes breakdown
  const targetFtesKpi = kpis.find(k => k.id === 'target-ftes');
  const targetBreakdown = targetFtesKpi?.employmentBreakdown;

  // Find indices of KPIs for grid positioning
  const targetIndex = kpis.findIndex(k => k.id === 'target-ftes');
  const hiredIndex = kpis.findIndex(k => k.id === 'hired-ftes');
  const openReqsIndex = kpis.findIndex(k => k.id === 'open-reqs');
  const hasConnectedKpis = hiredIndex !== -1 && openReqsIndex !== -1 && sharedBreakdown;

  return (
    <div className="space-y-4 pb-4 border-b border-border/50 last:border-b-0">
      <div className="relative group flex items-center gap-2">
        {dragHandleProps && (
          <div
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-primary active:text-primary transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder section"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      
      {/* KPI Grid */}
      <div className={cn(
        "gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4",
        xlGridCols
      )}>
        {kpis.map((kpi) => (
          <div key={kpi.id}>
            <KPICard 
              {...kpi}
              dataTour={`kpi-${kpi.id}`}
              employmentBreakdown={kpi.id === 'hired-ftes' || kpi.id === 'target-ftes' ? undefined : kpi.employmentBreakdown}
              dataTourChart={kpi.chartData && kpi.chartData.length > 0 ? `kpi-${kpi.id}-chart` : undefined}
              dataTourInfo={`kpi-${kpi.id}-info`}
            />
          </div>
        ))}
      </div>

      {/* Badges Row - positioned under respective KPI columns with vertical connectors */}
      {(targetBreakdown || (hasConnectedKpis && sharedBreakdown)) && (
        <div className={cn("hidden xl:grid relative z-10", xlGridCols)} style={{ gap: 'inherit', marginTop: '0' }}>
          {/* Spacers before Target FTEs */}
          {Array.from({ length: targetIndex }).map((_, i) => (
            <div key={`spacer-before-target-${i}`} />
          ))}
          
          {/* Target FTEs Badge (Green) with vertical connector - height matches Hired/Open connector total */}
          {targetBreakdown && targetIndex !== -1 && (
            <div className="flex flex-col items-center" data-tour="kpi-split-badge">
              {/* Vertical connector line - 16px to stay below KPI cards */}
              <div className="w-0.5 bg-emerald-500/60 dark:bg-emerald-400/70" style={{ height: '16px' }} />
              {/* Badge */}
              <div
                onClick={() => setShowTargetBreakdownModal(true)}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs",
                  "cursor-pointer transition-shadow duration-200 hover:shadow-md whitespace-nowrap",
                  "bg-emerald-500/10 dark:bg-emerald-500/20 hover:shadow-emerald-300/40"
                )}
              >
                <Info className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                  {targetBreakdown.ft}% FT · {targetBreakdown.pt}% PT · {targetBreakdown.prn}% PRN
                </span>
              </div>
            </div>
          )}
          
          {/* Spacers between Target and Hired */}
          {Array.from({ length: Math.max(0, hiredIndex - targetIndex - 1) }).map((_, i) => (
            <div key={`spacer-between-${i}`} />
          ))}
          
          {/* Hired and Open Reqs Badge (Red) with vertical connectors */}
          {hasConnectedKpis && sharedBreakdown && (
            <div className="col-span-3" data-tour="kpi-hired-split-badge">
              {/* Grid for vertical connectors from Hired FTEs and Open Reqs - h-2 (8px) */}
              <div className="grid grid-cols-3">
                {/* Connector from Hired FTEs (first column) */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-2 bg-orange-500/60 dark:bg-orange-400/70" />
                </div>
                {/* Empty middle column (FTE Variance) */}
                <div />
                {/* Connector from Open Reqs (third column) */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-2 bg-orange-500/60 dark:bg-orange-400/70" />
                </div>
              </div>
              {/* Horizontal line connecting the two vertical lines - h-0.5 (2px) */}
              <div className="grid grid-cols-3">
                <div className="flex items-start">
                  <div className="w-1/2" />
                  <div className="w-1/2 h-0.5 bg-orange-500/60 dark:bg-orange-400/70" />
                </div>
                <div className="h-0.5 bg-orange-500/60 dark:bg-orange-400/70" />
                <div className="flex items-start">
                  <div className="w-1/2 h-0.5 bg-orange-500/60 dark:bg-orange-400/70" />
                  <div className="w-1/2" />
                </div>
              </div>
              {/* Vertical line down to badge - h-1.5 (6px) */}
              <div className="flex justify-center">
                <div className="w-0.5 h-1.5 bg-orange-500/60 dark:bg-orange-400/70" />
              </div>
              {/* Badge */}
              <div className="flex justify-center">
                <div
                  onClick={() => setShowBreakdownModal(true)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs",
                    "cursor-pointer transition-shadow duration-200 hover:shadow-md whitespace-nowrap",
                    "bg-orange-500/10 dark:bg-orange-500/20 hover:shadow-orange-300/40"
                  )}
                >
                  <Info className="h-3 w-3 shrink-0 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">
                    Hired and Open Reqs: {sharedBreakdown.ft}% FT · {sharedBreakdown.pt}% PT · {sharedBreakdown.prn}% PRN
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Volume UOS Breakdown Badge with 6-column connectors */}
      {volumeBreakdown && volumeBreakdown.length > 0 && (
        <div className="hidden xl:grid grid-cols-6 relative z-10" style={{ gap: 'inherit', marginTop: '0' }}>
          {/* Row 1: Vertical drops from each of the 6 columns */}
          <div className="col-span-6 grid grid-cols-6" style={{ gap: 'inherit' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`vol-drop-${i}`} className="flex justify-center">
                <div className="w-0.5 h-2 bg-primary/60 dark:bg-primary/70" />
              </div>
            ))}
          </div>
          {/* Row 2: Horizontal bar from col 1 center to col 6 center */}
          <div className="col-span-6 grid grid-cols-6" style={{ gap: 'inherit' }}>
            <div className="flex items-start">
              <div className="w-1/2" />
              <div className="w-1/2 h-0.5 bg-primary/60 dark:bg-primary/70" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`vol-hbar-${i}`} className="h-0.5 bg-primary/60 dark:bg-primary/70" />
            ))}
            <div className="flex items-start">
              <div className="w-1/2 h-0.5 bg-primary/60 dark:bg-primary/70" />
              <div className="w-1/2" />
            </div>
          </div>
          {/* Row 3: Single centered vertical line down to badge */}
          <div className="col-span-6 flex justify-center">
            <div className="w-0.5 h-1.5 bg-primary/60 dark:bg-primary/70" />
          </div>
          {/* Row 4: Blue pill badge */}
          <div className="col-span-6 flex justify-center">
            <div
              onClick={() => setShowVolumeBreakdownModal(true)}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs",
                "cursor-pointer transition-shadow duration-200 hover:shadow-md whitespace-nowrap",
                "bg-primary/10 dark:bg-primary/20 hover:shadow-primary/30"
              )}
            >
              <Info className="h-3 w-3 shrink-0 text-primary" />
              <span className="font-medium text-primary">
                Viewing: {volumeBreakdown.map(d => d.label).join(' · ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Volume UOS Breakdown Modal */}
      <Dialog open={showVolumeBreakdownModal} onOpenChange={setShowVolumeBreakdownModal}>
        <DialogContent className="sm:max-w-md border-border/20 focus:outline-none focus-visible:outline-none focus-visible:ring-0 z-[100]">
          <DialogHeader>
            <DialogTitle>Volume by Unit of Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Target volume breakdown by unit of service type for the current filter selection:
            </p>
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="text-sm font-medium mb-3 text-primary">Unit of Service Breakdown</h4>
              <div className="space-y-2">
                {volumeBreakdown?.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium text-primary">{value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {volumeBreakdown && volumeBreakdown.length > 1 && (
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-sm font-medium">
                  <span>Total</span>
                  <span className="text-primary">
                    {volumeBreakdown.reduce((s, d) => s + d.value, 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={showBreakdownModal} onOpenChange={setShowBreakdownModal}>
        <DialogContent className="sm:max-w-md border-border/20 focus:outline-none focus-visible:outline-none focus-visible:ring-0 z-[100]">
          <DialogHeader>
            <DialogTitle>Employment Type Split Requirement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The organization targets a <strong>70/20/10</strong> employment type split to balance workforce stability with flexibility:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>70% Full-Time (FT)</strong> – Core workforce stability</li>
              <li><strong>20% Part-Time (PT)</strong> – Scheduling flexibility</li>
              <li><strong>10% PRN</strong> – Peak demand coverage</li>
            </ul>
            
            {sharedBreakdown && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Current vs Target (Hired + Open Reqs)</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Full-Time', current: sharedBreakdown.ft, target: 70 },
                    { label: 'Part-Time', current: sharedBreakdown.pt, target: 20 },
                    { label: 'PRN', current: sharedBreakdown.prn, target: 10 },
                  ].map(({ label, current, target }) => {
                    const variance = current - target;
                    const isOnTarget = Math.abs(variance) < 1;
                    return (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "font-medium",
                            isOnTarget ? "text-emerald-500" : "text-orange-500"
                          )}>
                            {current}%
                          </span>
                          <span className="text-muted-foreground">vs {target}%</span>
                          {!isOnTarget && (
                            <span className={cn(
                              "text-xs",
                              variance > 0 ? "text-orange-500" : "text-orange-500"
                            )}>
                              ({variance > 0 ? '+' : ''}{variance.toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Target FTEs Employment Type Split Modal */}
      <Dialog open={showTargetBreakdownModal} onOpenChange={setShowTargetBreakdownModal}>
        <DialogContent className="sm:max-w-md border-border/20 focus:outline-none focus-visible:outline-none focus-visible:ring-0 z-[100]">
          <DialogHeader>
            <DialogTitle>Target Employment Type Split</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The organization targets a <strong>70/20/10</strong> employment type split to balance workforce stability with flexibility:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>70% Full-Time (FT)</strong> – Core workforce stability</li>
              <li><strong>20% Part-Time (PT)</strong> – Scheduling flexibility</li>
              <li><strong>10% PRN</strong> – Peak demand coverage</li>
            </ul>
            
            {targetBreakdown && (
              <div className="mt-4 p-4 bg-emerald-500/10 rounded-lg">
                <h4 className="text-sm font-medium mb-3 text-emerald-700">Target Split</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Full-Time', value: targetBreakdown.ft },
                    { label: 'Part-Time', value: targetBreakdown.pt },
                    { label: 'PRN', value: targetBreakdown.prn },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-medium text-emerald-700">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
