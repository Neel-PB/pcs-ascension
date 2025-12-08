import { WorkforceKPICard } from './WorkforceKPICard';

interface KPIConfig {
  id: string;
  label: string;
  value: string | number | null;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isNegative?: boolean;
  chartData?: Array<{ value: number }>;
  chartType?: 'line' | 'bar' | 'area';
  definition?: string;
  calculation?: string;
}

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
  // Mock chart data for demonstration
  const mockChartData = [
    { value: 42 }, { value: 44 }, { value: 43 }, { value: 45 }, 
    { value: 46 }, { value: 45.5 }
  ];

  // Mock data - will be connected to real data later
  const commonKPIs: KPIConfig[] = [
    { 
      id: 'hired_fte', 
      label: 'Hired FTE', 
      value: 45.5,
      chartData: mockChartData,
      definition: 'Total FTE count of all hired positions',
      calculation: 'Sum of FTE values for all filled positions'
    },
    { 
      id: 'target_fte', 
      label: 'Target FTE', 
      value: 48.0,
      chartData: mockChartData,
      definition: 'Target FTE based on volume and staffing standards',
      calculation: 'Volume × Staffing Ratio'
    },
    { 
      id: 'fte_variance', 
      label: 'FTE Variance', 
      value: -2.5, 
      trend: 'down', 
      trendValue: '5.2%',
      isNegative: true,
      chartData: [{ value: -1.5 }, { value: -2.0 }, { value: -1.8 }, { value: -2.5 }],
      definition: 'Difference between Hired FTE and Target FTE',
      calculation: 'Hired FTE - Target FTE'
    },
    { 
      id: 'open_reqs', 
      label: 'Open Reqs', 
      value: 12,
      chartData: [{ value: 15 }, { value: 14 }, { value: 13 }, { value: 12 }],
      definition: 'Number of open requisitions',
      calculation: 'Count of requisitions with status = Open'
    },
    { 
      id: 'req_variance', 
      label: 'Req Variance', 
      value: 3, 
      trend: 'up', 
      trendValue: '2',
      definition: 'Variance in requisition count from target',
      calculation: 'Open Reqs - Expected Reqs'
    },
    { 
      id: 'volume', 
      label: 'Volume', 
      value: selectedDepartment ? volumeValue : null,
      definition: selectedDepartment 
        ? `${volumeType === 'override' ? 'Override' : 'Target'} volume for the selected department`
        : 'Select a department to view volume',
      calculation: volumeType === 'override' 
        ? 'Manually set override value' 
        : 'Average daily volume from historical data'
    },
  ];

  const employeeKPIs: KPIConfig[] = [
    { 
      id: 'employed_productive_ftes', 
      label: 'Employed Productive FTEs', 
      value: 42.0,
      chartData: mockChartData,
      definition: 'FTEs actively contributing to production',
      calculation: 'Hired FTE - Non-productive FTE'
    },
    { 
      id: 'overtime_fte', 
      label: 'Overtime FTE', 
      value: 3.5,
      chartData: [{ value: 2.5 }, { value: 3.0 }, { value: 3.2 }, { value: 3.5 }],
      definition: 'FTE equivalent of overtime hours worked',
      calculation: 'Total overtime hours / Standard hours per FTE'
    },
    { 
      id: 'total_prn', 
      label: 'Total PRN', 
      value: 8,
      definition: 'Count of PRN (as needed) staff',
      calculation: 'Count of employees with employment type = PRN'
    },
  ];

  const contractorKPIs: KPIConfig[] = [
    { 
      id: 'contractor_fte', 
      label: 'Contractor FTE', 
      value: 12.5,
      chartData: [{ value: 10 }, { value: 11 }, { value: 12 }, { value: 12.5 }],
      definition: 'Total FTE from contracted staff',
      calculation: 'Sum of FTE for all contractor positions'
    },
  ];

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

  const allKPIs = [...commonKPIs, ...getTabSpecificKPIs()];

  return (
    <div className="grid grid-cols-2 gap-2">
      {allKPIs.map((kpi) => (
        <WorkforceKPICard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
          isNegative={kpi.isNegative}
          chartData={kpi.chartData}
          chartType={kpi.chartType}
          definition={kpi.definition}
          calculation={kpi.calculation}
        />
      ))}
    </div>
  );
};
