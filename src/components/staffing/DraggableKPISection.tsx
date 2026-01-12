import { useState } from 'react';
import { KPICard, EmploymentBreakdown } from './KPICard';
import { Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface KPIData {
  id: string;
  title: string;
  value: string;
  chartData: any[];
  chartType: 'line' | 'bar' | 'area';
  delay: number;
  definition: string;
  calculation: string;
  isNegative?: boolean;
  isHighlighted?: boolean;
  useVacancyModal?: boolean;
  vacancyData?: any[];
  employmentBreakdown?: EmploymentBreakdown;
  breakdownVariant?: 'green' | 'red';
}

interface DragHandleProps {
  attributes: any;
  listeners: any;
}

interface DraggableKPISectionProps {
  title: string;
  kpis: KPIData[];
  dragHandleProps?: DragHandleProps;
}

// Only Hired FTEs and Open Reqs get rounded-b-none (not FTE Variance)
const BREAKDOWN_CONNECTED_IDS = ['hired-ftes', 'open-reqs'];

export function DraggableKPISection({ title, kpis, dragHandleProps }: DraggableKPISectionProps) {
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showTargetBreakdownModal, setShowTargetBreakdownModal] = useState(false);

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
    <div className="space-y-4">
      <div className="relative group">
        {dragHandleProps && (
          <div
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder section"
          >
            <div className="w-1.5 h-6 bg-muted-foreground/40 rounded-full hover:bg-muted-foreground transition-colors" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      
      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KPICard 
            key={kpi.id} 
            {...kpi}
            // Remove breakdown for hired-ftes and target-ftes (they use the shared badge row below)
            employmentBreakdown={kpi.id === 'hired-ftes' || kpi.id === 'target-ftes' ? undefined : kpi.employmentBreakdown}
          />
        ))}
      </div>

      {/* Badges Row - positioned under respective KPI columns with vertical connectors */}
      {(targetBreakdown || (hasConnectedKpis && sharedBreakdown)) && (
        <div className="hidden xl:grid grid-cols-6 relative z-10" style={{ gap: 'inherit', marginTop: '-16px' }}>
          {/* Spacers before Target FTEs */}
          {Array.from({ length: targetIndex }).map((_, i) => (
            <div key={`spacer-before-target-${i}`} />
          ))}
          
          {/* Target FTEs Badge (Green) with vertical connector - height matches Hired/Open connector total */}
          {targetBreakdown && targetIndex !== -1 && (
            <div className="flex flex-col items-center">
              {/* Vertical connector line - 22px to match: h-3 (12px) + h-0.5 (2px) + h-2 (8px) = 22px */}
              <div className="w-0.5 bg-emerald-500/40" style={{ height: '22px' }} />
              {/* Badge */}
              <div
                onClick={() => setShowTargetBreakdownModal(true)}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs",
                  "cursor-pointer transition-shadow duration-200 hover:shadow-md whitespace-nowrap",
                  "bg-emerald-500/10 hover:shadow-emerald-300/40"
                )}
              >
                <Info className="h-3 w-3 shrink-0 text-emerald-600" />
                <span className="font-medium text-emerald-700">
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
            <div className="col-span-3">
              {/* Grid for vertical connectors from Hired FTEs and Open Reqs - h-3 (12px) */}
              <div className="grid grid-cols-3">
                {/* Connector from Hired FTEs (first column) */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-3 bg-destructive/40" />
                </div>
                {/* Empty middle column (FTE Variance) */}
                <div />
                {/* Connector from Open Reqs (third column) */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-3 bg-destructive/40" />
                </div>
              </div>
              {/* Horizontal line connecting the two vertical lines - h-0.5 (2px) */}
              <div className="grid grid-cols-3">
                <div className="flex items-start">
                  <div className="w-1/2" />
                  <div className="w-1/2 h-0.5 bg-destructive/40" />
                </div>
                <div className="h-0.5 bg-destructive/40" />
                <div className="flex items-start">
                  <div className="w-1/2 h-0.5 bg-destructive/40" />
                  <div className="w-1/2" />
                </div>
              </div>
              {/* Vertical line down to badge - h-2 (8px) */}
              <div className="flex justify-center">
                <div className="w-0.5 h-2 bg-destructive/40" />
              </div>
              {/* Badge */}
              <div className="flex justify-center">
                <div
                  onClick={() => setShowBreakdownModal(true)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs",
                    "cursor-pointer transition-shadow duration-200 hover:shadow-md whitespace-nowrap",
                    "bg-destructive/10 hover:shadow-destructive/30"
                  )}
                >
                  <Info className="h-3 w-3 shrink-0 text-destructive" />
                  <span className="font-medium text-destructive">
                    Hired and Open Reqs: {sharedBreakdown.ft}% FT · {sharedBreakdown.pt}% PT · {sharedBreakdown.prn}% PRN
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employment Type Split Modal */}
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
                            isOnTarget ? "text-emerald-500" : "text-red-500"
                          )}>
                            {current}%
                          </span>
                          <span className="text-muted-foreground">vs {target}%</span>
                          {!isOnTarget && (
                            <span className={cn(
                              "text-xs",
                              variance > 0 ? "text-red-500" : "text-red-500"
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
