import React, { useMemo } from 'react';
import { WorkforceKPICard } from './WorkforceKPICard';
import { ForecastChecklistTable } from './ForecastChecklistTable';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-2">
      <Tabs defaultValue="kpis" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full" data-tour="checklist-tabs">
          <TabsTrigger value="kpis" className="flex-1">KPIs</TabsTrigger>
          <TabsTrigger value="shortage" className="flex-1">
            Shortage <Badge variant="secondary" className="ml-1.5">{shortageCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="surplus" className="flex-1">
            Surplus <Badge variant="secondary" className="ml-1.5">{surplusCount}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="kpis" className="flex-1 min-h-0 mt-2 overflow-y-auto data-[state=inactive]:hidden" data-tour="checklist-kpis">
          <div className="grid grid-cols-3 gap-2">
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
        </TabsContent>
        <TabsContent value="shortage" className="flex-1 min-h-0 mt-2 flex flex-col data-[state=inactive]:hidden" data-tour="checklist-table">
          <ForecastChecklistTable type="shortage" filters={filters} />
        </TabsContent>
        <TabsContent value="surplus" className="flex-1 min-h-0 mt-2 flex flex-col data-[state=inactive]:hidden">
          <ForecastChecklistTable type="surplus" filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
