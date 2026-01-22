import { useMemo, useState } from 'react';
import { WorkforceKPICard } from './WorkforceKPICard';
import { ForecastChecklistTable } from './ForecastChecklistTable';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getFTEKPIs, 
  getProductivityKPIs, 
  getVolumeKPIForWorkforce,
  KPIConfig 
} from '@/config/kpiConfigs';
import { useForecastChecklist } from '@/hooks/useForecastChecklist';
import { ForecastBalanceFilters } from '@/hooks/useForecastBalance';

interface WorkforceKPISectionProps {
  activeTab?: string;
  selectedDepartment?: string | null;
  selectedRegion?: string | null;
  selectedMarket?: string | null;
  selectedFacility?: string | null;
  selectedLevel2?: string | null;
  selectedPstat?: string | null;
  volumeType?: 'target' | 'override' | null;
  volumeValue?: number | null;
}

export const WorkforceKPISection = ({ 
  activeTab = 'employees',
  selectedDepartment,
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedLevel2,
  selectedPstat,
  volumeType,
  volumeValue 
}: WorkforceKPISectionProps) => {
  const [kpisExpanded, setKpisExpanded] = useState(false);
  
  // Create filters object for forecast data
  const filters: ForecastBalanceFilters = useMemo(() => ({
    departmentId: selectedDepartment,
    region: selectedRegion,
    market: selectedMarket,
    facilityId: selectedFacility,
    level2: selectedLevel2,
    pstat: selectedPstat,
  }), [selectedDepartment, selectedRegion, selectedMarket, selectedFacility, selectedLevel2, selectedPstat]);
  
  // Get checklist data for counts
  const { openings, closures } = useForecastChecklist(filters);
  const shortageCount = openings.length;
  const surplusCount = closures.length;
  
  // Get shared KPIs from config
  const fteKPIs = useMemo(() => getFTEKPIs(), []);
  const productivityKPIs = useMemo(() => getProductivityKPIs(), []);
  const volumeKPI = useMemo(
    () => getVolumeKPIForWorkforce(selectedDepartment, volumeType, volumeValue),
    [selectedDepartment, volumeType, volumeValue]
  );

  // Common KPIs for all tabs (subset of FTE KPIs + Volume)
  const commonKPIs = useMemo(() => {
    const hiredFte = fteKPIs.find(k => k.id === 'hired-ftes');
    const targetFte = fteKPIs.find(k => k.id === 'target-ftes');
    const fteVariance = fteKPIs.find(k => k.id === 'fte-variance');
    const openReqs = fteKPIs.find(k => k.id === 'open-reqs');
    const reqVariance = fteKPIs.find(k => k.id === 'req-variance');

    return [
      hiredFte,
      targetFte,
      fteVariance,
      openReqs,
      reqVariance,
      volumeKPI,
    ].filter(Boolean) as KPIConfig[];
  }, [fteKPIs, volumeKPI]);

  // Employee-specific KPIs (from Productivity KPIs, no FTE Shortage card)
  const employeeKPIs = useMemo(() => {
    const employedProductive = productivityKPIs.find(k => k.id === 'total-fullpart-ftes');
    const overtimeFtes = productivityKPIs.find(k => k.id === 'overtime-ftes');
    const totalPrn = productivityKPIs.find(k => k.id === 'total-prn');

    return [
      employedProductive,
      overtimeFtes,
      totalPrn,
    ].filter(Boolean) as KPIConfig[];
  }, [productivityKPIs]);

  // Contractor-specific KPIs (from Productivity KPIs, no FTE Shortage card)
  const contractorKPIs = useMemo(() => {
    const contractFtes = productivityKPIs.find(k => k.id === 'contract-ftes');

    return [contractFtes].filter(Boolean) as KPIConfig[];
  }, [productivityKPIs]);

  // No KPI cards for requisitions (table only)
  const requisitionKPIs: KPIConfig[] = [];

  // Determine which KPIs to show based on active tab
  const getTabSpecificKPIs = (): KPIConfig[] => {
    switch (activeTab) {
      case 'employees':
        return employeeKPIs;
      case 'contractors':
        return contractorKPIs;
      case 'requisitions':
        return requisitionKPIs;
      default:
        return [];
    }
  };

  const tabSpecificKPIs = getTabSpecificKPIs();

  // Determine if we should show forecast tables (for Positions module tabs)
  const showForecastTables = ['employees', 'contractors', 'requisitions'].includes(activeTab);
  
  // For Staffing module tabs, show both tables without tabs
  const showBothTables = ['summary', 'planning', 'variance', 'forecasts'].includes(activeTab);

  // Get compact summary values for collapsed state
  const hiredValue = commonKPIs.find(k => k.id === 'hired-ftes')?.value ?? '—';
  const targetValue = commonKPIs.find(k => k.id === 'target-ftes')?.value ?? '—';
  const varianceValue = commonKPIs.find(k => k.id === 'fte-variance')?.value ?? '—';

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-2">
      {/* Collapsible KPI Section */}
      <Collapsible open={kpisExpanded} onOpenChange={setKpisExpanded}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/50 rounded-md transition-colors">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">KPIs</span>
          {!kpisExpanded && (
            <span className="text-xs text-muted-foreground flex-1 text-right mr-2">
              Hired: {hiredValue} | Target: {targetValue} | Var: {varianceValue}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", kpisExpanded && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Common KPIs Section */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {commonKPIs.map((kpi) => (
              <WorkforceKPICard
                key={kpi.id}
                label={kpi.title}
                value={kpi.value}
                chartData={kpi.chartData}
                chartType={kpi.chartType}
                definition={kpi.definition}
                calculation={kpi.calculation}
                breakdownData={kpi.breakdownData}
                xAxisLabels={kpi.xAxisLabels}
                decimalPlaces={kpi.decimalPlaces}
              />
            ))}
          </div>

          {/* Separator and Tab-specific KPIs */}
          {tabSpecificKPIs.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="grid grid-cols-3 gap-2">
                {tabSpecificKPIs.map((kpi) => (
                  <WorkforceKPICard
                    key={kpi.id}
                    label={kpi.title}
                    value={kpi.value}
                    chartData={kpi.chartData}
                    chartType={kpi.chartType}
                    definition={kpi.definition}
                    calculation={kpi.calculation}
                    breakdownData={kpi.breakdownData}
                    xAxisLabels={kpi.xAxisLabels}
                    decimalPlaces={kpi.decimalPlaces}
                  />
                ))}
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Tabbed Shortage/Surplus for Positions module */}
      {showForecastTables && (
        <Tabs defaultValue="shortage" className="flex-1 flex flex-col min-h-0">
          <TabsList className="shrink-0 w-full justify-start bg-transparent p-0 h-auto gap-1">
            <TabsTrigger value="shortage" className="text-xs px-3 py-1.5 data-[state=active]:shadow-none">
              Shortage
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                {shortageCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="surplus" className="text-xs px-3 py-1.5 data-[state=active]:shadow-none">
              Surplus
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                {surplusCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="shortage" className="flex-1 min-h-0 overflow-hidden mt-2">
            <div className="h-full overflow-y-auto">
              <ForecastChecklistTable type="shortage" filters={filters} />
            </div>
          </TabsContent>
          <TabsContent value="surplus" className="flex-1 min-h-0 overflow-hidden mt-2">
            <div className="h-full overflow-y-auto">
              <ForecastChecklistTable type="surplus" filters={filters} />
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Both tables for Staffing module (legacy behavior) */}
      {showBothTables && (
        <>
          <ForecastTableWithTitle type="shortage" filters={filters} />
          <ForecastTableWithTitle type="surplus" filters={filters} />
        </>
      )}
    </div>
  );
};

// Sub-component for Staffing module (shows both tables vertically)
function ForecastTableWithTitle({ type, filters }: { type: 'shortage' | 'surplus'; filters?: ForecastBalanceFilters }) {
  const { openings, closures } = useForecastChecklist(filters);
  
  const count = type === 'shortage' ? openings.length : closures.length;
  const title = type === 'shortage' ? 'FTE Shortage' : 'FTE Surplus';

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <Separator className="my-2" />
      <div className="flex-1 flex flex-col min-h-0 mt-3 overflow-hidden">
        <h3 className="text-sm font-medium text-foreground mb-2 flex-shrink-0">
          {title} <span className="text-muted-foreground">({count})</span>
        </h3>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ForecastChecklistTable type={type} filters={filters} />
        </div>
      </div>
    </div>
  );
}
