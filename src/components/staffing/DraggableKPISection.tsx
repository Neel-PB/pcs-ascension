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

  // Get the shared breakdown from hired-ftes
  const hiredFtesKpi = kpis.find(k => k.id === 'hired-ftes');
  const sharedBreakdown = hiredFtesKpi?.employmentBreakdown;
  const breakdownVariant = hiredFtesKpi?.breakdownVariant || 'red';

  // Find indices of connected KPIs for grid positioning
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
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {kpis.map((kpi) => {
          // Check if this KPI should have rounded-b-none for breakdown connection
          const isConnectedKpi = BREAKDOWN_CONNECTED_IDS.includes(kpi.id) && hasConnectedKpis;
          
          return (
            <KPICard 
              key={kpi.id} 
              {...kpi}
              // Only remove breakdown for hired-ftes (it uses the shared bar)
              // Keep breakdown for target-ftes and all other KPIs
              employmentBreakdown={kpi.id === 'hired-ftes' ? undefined : kpi.employmentBreakdown}
              className={undefined}
            />
          );
        })}
      </div>

      {/* Shared Breakdown Bar with upward connector lines */}
      {hasConnectedKpis && sharedBreakdown && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" style={{ marginTop: '-8px', marginBottom: '-4px' }}>
          {/* Empty spacers for columns before hired-ftes */}
          {Array.from({ length: hiredIndex }).map((_, i) => (
            <div key={`spacer-${i}`} className="hidden xl:block" />
          ))}
          
          {/* Container spanning 3 columns */}
          <div 
            className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-3 relative"
            style={{ gridColumn: `span 3 / span 3` }}
          >
            {/* Breakdown bar with connector lines from edges */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                {/* Connector structure: vertical lines at edges with horizontal line */}
                <div className="flex items-end">
                  {/* Left vertical line - rising up from badge left edge */}
                  <div className={cn(
                    "w-0.5 h-6",
                    breakdownVariant === 'green' ? "bg-emerald-500/60" : "bg-destructive/60"
                  )} />
                  
                  {/* Horizontal connector across the top of badge */}
                  <div className={cn(
                    "h-0.5 flex-1",
                    breakdownVariant === 'green' ? "bg-emerald-500/60" : "bg-destructive/60"
                  )} style={{ minWidth: '280px' }} />
                  
                  {/* Right vertical line - rising up from badge right edge */}
                  <div className={cn(
                    "w-0.5 h-6",
                    breakdownVariant === 'green' ? "bg-emerald-500/60" : "bg-destructive/60"
                  )} />
                </div>
                
                {/* The badge itself - width matches the horizontal line above */}
                <div
                  onClick={() => setShowBreakdownModal(true)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-2 py-1 rounded-b-lg text-xs",
                    "cursor-pointer transition-shadow duration-200 hover:shadow-md whitespace-nowrap",
                    breakdownVariant === 'green' && "bg-emerald-500/10 hover:shadow-emerald-300/40",
                    breakdownVariant === 'red' && "bg-destructive/10 hover:shadow-destructive/30"
                  )}
                  style={{ minWidth: '280px' }}
                >
                  <Info className={cn(
                    "h-3 w-3 shrink-0",
                    breakdownVariant === 'green' && "text-emerald-600",
                    breakdownVariant === 'red' && "text-destructive"
                  )} />
                  <span className={cn(
                    "font-medium",
                    breakdownVariant === 'green' && "text-emerald-700",
                    breakdownVariant === 'red' && "text-destructive"
                  )}>
                    Hired and Open Reqs: {sharedBreakdown.ft}% FT · {sharedBreakdown.pt}% PT · {sharedBreakdown.prn}% PRN
                  </span>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
}
