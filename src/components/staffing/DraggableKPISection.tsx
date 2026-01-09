import { KPICard, EmploymentBreakdown } from './KPICard';
import { KPICardGroup } from './KPICardGroup';
import { Fragment } from 'react';

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

export function DraggableKPISection({ title, kpis, dragHandleProps }: DraggableKPISectionProps) {
  // Find grouped KPIs (hired-ftes and open-reqs)
  const hiredFtesKpi = kpis.find(k => k.id === 'hired-ftes');
  const openReqsKpi = kpis.find(k => k.id === 'open-reqs');
  const shouldGroupHiredAndReqs = hiredFtesKpi && openReqsKpi;

  // Get the shared breakdown from hired-ftes (which has the combined data)
  const sharedBreakdown = hiredFtesKpi?.employmentBreakdown;

  // Build render items maintaining original order but grouping hired-ftes + open-reqs
  const renderItems: { type: 'single' | 'group'; kpi?: KPIData; groupKpis?: KPIData[] }[] = [];
  let groupInserted = false;

  kpis.forEach((kpi) => {
    if (shouldGroupHiredAndReqs && (kpi.id === 'hired-ftes' || kpi.id === 'open-reqs')) {
      // Insert the group once when we encounter hired-ftes
      if (kpi.id === 'hired-ftes' && !groupInserted) {
        renderItems.push({ 
          type: 'group', 
          groupKpis: [hiredFtesKpi, openReqsKpi] 
        });
        groupInserted = true;
      }
      // Skip open-reqs since it's part of the group
      return;
    }
    renderItems.push({ type: 'single', kpi });
  });

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
        {renderItems.map((item, idx) => {
          if (item.type === 'group' && item.groupKpis && sharedBreakdown) {
            return (
              <KPICardGroup
                key="hired-openreqs-group"
                cards={item.groupKpis.map(kpi => ({
                  id: kpi.id,
                  title: kpi.title,
                  value: kpi.value,
                  chartData: kpi.chartData,
                  chartType: kpi.chartType,
                  delay: kpi.delay,
                  definition: kpi.definition,
                  calculation: kpi.calculation,
                }))}
                sharedBreakdown={sharedBreakdown}
                breakdownVariant={hiredFtesKpi?.breakdownVariant || 'red'}
                groupDelay={hiredFtesKpi?.delay || 0}
              />
            );
          }
          if (item.type === 'single' && item.kpi) {
            return <KPICard key={item.kpi.id} {...item.kpi} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
