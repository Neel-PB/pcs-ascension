import { WorkforceKPICard } from './WorkforceKPICard';

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
  // Mock data - will be connected to real data later
  const commonKPIs = [
    { id: 'hired_fte', label: 'Hired FTE', value: 45.5 },
    { id: 'target_fte', label: 'Target FTE', value: 48.0 },
    { id: 'fte_variance', label: 'FTE Variance', value: -2.5, trend: 'down' as const, isNegative: true },
    { id: 'open_reqs', label: 'Open Reqs', value: 12 },
    { id: 'req_variance', label: 'Req Variance', value: 3, trend: 'up' as const },
    { 
      id: 'volume', 
      label: 'Volume', 
      value: selectedDepartment ? volumeValue : null 
    },
  ];

  const employeeKPIs = [
    { id: 'employed_productive_ftes', label: 'Employed Productive FTEs', value: 42.0 },
    { id: 'overtime_fte', label: 'Overtime FTE', value: 3.5 },
    { id: 'total_prn', label: 'Total PRN', value: 8 },
  ];

  const contractorKPIs = [
    { id: 'contractor_fte', label: 'Contractor FTE', value: 12.5 },
  ];

  // Determine which KPIs to show based on active tab
  const getTabSpecificKPIs = () => {
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
          trend={'trend' in kpi ? (kpi.trend as 'up' | 'down' | 'neutral') : undefined}
          isNegative={'isNegative' in kpi ? (kpi.isNegative as boolean) : undefined}
        />
      ))}
    </div>
  );
};
