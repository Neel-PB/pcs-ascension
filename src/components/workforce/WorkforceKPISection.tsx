import { useMemo } from 'react';
import { WorkforceKPICard } from './WorkforceKPICard';
import { Separator } from '@/components/ui/separator';
import { 
  getFTEKPIs, 
  getProductivityKPIs, 
  getVolumeKPIForWorkforce,
  KPIConfig 
} from '@/config/kpiConfigs';

interface WorkforceKPISectionProps {
  activeTab?: string;
  selectedDepartment?: string | null;
  volumeType?: 'target' | 'override' | null;
  volumeValue?: number | null;
}

export const WorkforceKPISection = ({ 
  activeTab = 'employees',
  selectedDepartment,
  volumeType,
  volumeValue 
}: WorkforceKPISectionProps) => {
  
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

  // Employee-specific KPIs (from Productivity KPIs)
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

  // Contractor-specific KPIs (from Productivity KPIs)
  const contractorKPIs = useMemo(() => {
    const contractFtes = productivityKPIs.find(k => k.id === 'contract-ftes');

    return [contractFtes].filter(Boolean) as KPIConfig[];
  }, [productivityKPIs]);

  // Determine which KPIs to show based on active tab
  const getTabSpecificKPIs = (): KPIConfig[] => {
    switch (activeTab) {
      case 'employees':
        return employeeKPIs;
      case 'contractors':
        return contractorKPIs;
      case 'requisitions':
      default:
        return [];
    }
  };

  const tabSpecificKPIs = getTabSpecificKPIs();

  return (
    <div className="space-y-3">
      {/* Fixed KPIs Section */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 px-0.5">
          Fixed KPIs
        </p>
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
      </div>

      {/* Separator and Variable KPIs - only show if there are tab-specific KPIs */}
      {tabSpecificKPIs.length > 0 && (
        <>
          <Separator className="my-2" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 px-0.5">
              Variable KPIs
            </p>
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
          </div>
        </>
      )}
    </div>
  );
};
