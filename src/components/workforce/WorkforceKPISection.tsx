import { useMemo } from 'react';
import { WorkforceKPICard } from './WorkforceKPICard';
import { ForecastChecklistTable } from './ForecastChecklistTable';
import { Separator } from '@/components/ui/separator';
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

  // Determine which forecast table to show
  const getForecastTableType = (): 'shortage' | 'surplus' | 'both' | null => {
    switch (activeTab) {
      // Positions module tabs
      case 'employees':
      case 'contractors':
        return 'shortage';
      case 'requisitions':
        return 'surplus';
      // Staffing module tabs - show both
      case 'summary':
      case 'planning':
      case 'variance':
      case 'forecasts':
        return 'both';
      default:
        return null;
    }
  };

  const forecastTableType = getForecastTableType();

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3">
      {/* Common KPIs Section */}
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

      {/* Forecast Table with Title */}
      {forecastTableType && forecastTableType !== 'both' && (
        <ForecastTableWithTitle type={forecastTableType} filters={filters} />
      )}
      
      {/* Both tables for Staffing module */}
      {forecastTableType === 'both' && (
        <>
          <ForecastTableWithTitle type="shortage" filters={filters} />
          <ForecastTableWithTitle type="surplus" filters={filters} />
        </>
      )}
    </div>
  );
};

// Sub-component to handle forecast table with title
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
