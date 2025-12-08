import { useMemo } from 'react';
import { WorkforceKPICard } from './WorkforceKPICard';
import { generateLast12MonthLabels } from '@/lib/utils';

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
  breakdownData?: Array<any>;
  xAxisLabels?: string[];
}

interface WorkforceKPISectionProps {
  activeTab?: string;
  selectedDepartment?: string | null;
  volumeType?: 'target' | 'override' | null;
  volumeValue?: number | null;
}

// Chart data generators matching Summary Tab
const generateGrowthTrend = (start: number, end: number, points: number = 24) => 
  Array.from({ length: points }, (_, i) => ({
    value: start + ((end - start) * i) / (points - 1) + (Math.random() - 0.5) * 2
  }));

const generateDeclineTrend = (start: number, end: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: start - ((start - end) * i) / (points - 1) + (Math.random() - 0.5) * 2
  }));

const generateVolatileTrend = (base: number, variance: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: base + Math.sin(i * 0.5) * variance + (Math.random() - 0.5) * (variance * 0.3)
  }));

const generateSeasonalTrend = (base: number, amplitude: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: base + Math.sin((i / points) * Math.PI * 2) * amplitude + (Math.random() - 0.5) * 2
  }));

export const WorkforceKPISection = ({ 
  activeTab = 'employees',
  selectedDepartment,
  volumeType,
  volumeValue 
}: WorkforceKPISectionProps) => {
  const xAxisLabels = useMemo(() => generateLast12MonthLabels(), []);

  // Common KPIs for all tabs - matching Summary Tab format
  const commonKPIs: KPIConfig[] = useMemo(() => [
    { 
      id: 'hired_fte', 
      label: 'Hired FTE', 
      value: 45.5,
      chartData: generateGrowthTrend(42, 45.5),
      chartType: 'bar' as const,
      xAxisLabels,
      definition: "Total Full-time, Part-Time and PRNs equivalent labor resources currently employed by the organization (PRNs counted as 0.2 FTEs commitment).",
      calculation: `Hired FTEs = Sum of all active employee FTEs

Includes:
• Full-time staff (1.0 FTE each)
• Part-time staff (0.5, 0.8, etc.)
• Active employees only (excludes open positions)`,
      breakdownData: [
        { skillType: 'RN', ftFtes: 25.0, ptFtes: 12.0, prnFtes: 4.0, totalActualPaidFtes: 41.0 },
        { skillType: 'Clinical Lead', ftFtes: 8.0, ptFtes: 3.0, prnFtes: 1.0, totalActualPaidFtes: 12.0 },
        { skillType: 'PCT', ftFtes: 6.0, ptFtes: 2.5, prnFtes: 0.5, totalActualPaidFtes: 9.0 },
        { skillType: 'TOTAL', ftFtes: 39.0, ptFtes: 17.5, prnFtes: 5.5, totalActualPaidFtes: 62.0 },
      ],
    },
    { 
      id: 'target_fte', 
      label: 'Target FTE', 
      value: 48.0,
      chartData: generateSeasonalTrend(48.0, 2),
      chartType: 'area' as const,
      xAxisLabels,
      definition: "The number of resources needed to meet budgeted staffing levels based on specific type and amount of Unit of Service.",
      calculation: `Target FTEs = (Expected Volume × Hours per Unit) / (Standard Hours per FTE × Expected Productivity %)

Determined by:
• Historical volume patterns
• Industry productivity benchmarks
• Department-specific standards`,
    },
    { 
      id: 'fte_variance', 
      label: 'FTE Variance', 
      value: -2.5, 
      trend: 'down' as const, 
      trendValue: '5.2%',
      isNegative: true,
      chartData: generateGrowthTrend(1.5, 2.5),
      chartType: 'area' as const,
      xAxisLabels,
      definition: "Variance between Hired FTEs and Target FTEs.",
      calculation: `FTE Variance = Target FTEs - Hired FTEs

Example: If target is 48.0 and hired is 45.5:
48.0 - 45.5 = 2.5 FTE shortage

A negative value indicates understaffing.`,
    },
    { 
      id: 'open_reqs', 
      label: 'Open Reqs', 
      value: 12,
      chartData: generateVolatileTrend(12, 3),
      chartType: 'bar' as const,
      xAxisLabels,
      definition: "The number of approved requisitions that have not yet been successfully filled.",
      calculation: `Open Requisitions = Count of all active job postings

Includes:
• Approved requisitions in recruiting
• Positions being screened/interviewed
• Offers extended but not yet accepted
Excludes: Filled positions, withdrawn postings`,
    },
    { 
      id: 'req_variance', 
      label: 'Req Variance', 
      value: 3, 
      trend: 'up' as const, 
      trendValue: '2',
      chartData: generateGrowthTrend(1.3, 3),
      chartType: 'line' as const,
      xAxisLabels,
      definition: "Variance between Hire FTEs plus Open Requisition and Target FTEs.",
      calculation: `Requisition Variance = FTE Variance - Open Requisitions

Example: If FTE Variance is 2.5 and Open Requisitions is 12:
2.5 - 12 = -9.5 (over-recruiting by 9.5 positions)`,
    },
    { 
      id: 'volume', 
      label: 'Volume', 
      value: selectedDepartment ? volumeValue : null,
      chartData: selectedDepartment ? generateSeasonalTrend(volumeValue || 20, 3) : undefined,
      chartType: 'area' as const,
      xAxisLabels,
      definition: selectedDepartment 
        ? `${volumeType === 'override' ? 'Override' : 'Target'} volume for the selected department. This is the expected daily volume used for staffing calculations.`
        : 'Select a department to view volume. Volume represents the expected daily patient encounters or units of service.',
      calculation: volumeType === 'override' 
        ? `Override Volume = Manually entered volume target

Used when:
• Known upcoming service changes
• Special projects or initiatives
• Temporary capacity adjustments
• Market-specific factors not in historical data`
        : `Target Volume = Forecasted daily volume based on historical data

Determined by:
• 12-month historical average
• Seasonal adjustment factors
• Strategic growth targets`,
    },
  ], [selectedDepartment, volumeType, volumeValue, xAxisLabels]);

  // Employee-specific KPIs
  const employeeKPIs: KPIConfig[] = useMemo(() => [
    { 
      id: 'employed_productive_ftes', 
      label: 'Employed Productive FTEs', 
      value: 42.0,
      chartData: generateGrowthTrend(39.5, 42.0),
      chartType: 'bar' as const,
      xAxisLabels,
      definition: "Total Full-time, Part-Time and PRNs productive equivalent labor resources the organization actually pays for.",
      calculation: `Employed Productive FTEs = Total Hired FTEs - Non-Productive Hours

Full Time FTEs = Sum of all FTEs where employmentType = "Full Time"
Part Time FTEs = Sum of all FTEs where employmentType = "Part Time"

This metric helps:
• Understand workforce composition
• Plan for benefits and scheduling
• Analyze labor cost structure`,
      breakdownData: [
        { skillType: 'RN', ftFtes: 22.0, ptFtes: 10.0, prnFtes: 3.5, totalActualPaidFtes: 35.5 },
        { skillType: 'Clinical Lead', ftFtes: 7.0, ptFtes: 2.5, prnFtes: 0.8, totalActualPaidFtes: 10.3 },
        { skillType: 'PCT', ftFtes: 5.0, ptFtes: 2.0, prnFtes: 0.4, totalActualPaidFtes: 7.4 },
        { skillType: 'TOTAL', ftFtes: 34.0, ptFtes: 14.5, prnFtes: 4.7, totalActualPaidFtes: 53.2 },
      ],
    },
    { 
      id: 'overtime_fte', 
      label: 'Overtime FTE', 
      value: 3.5,
      chartData: generateDeclineTrend(4.2, 3.5),
      chartType: 'area' as const,
      xAxisLabels,
      definition: "Total worked hours above regular (FT) commitment the organization actually pays for.",
      calculation: `Total Overtime FTEs = Total overtime hours / Standard FTE hours

Example: If 728 overtime hours worked in 2 weeks:
728 / (40 × 2) = 9.1 overtime FTE equivalent

Note: This is the volume equivalent, not cost equivalent`,
    },
    { 
      id: 'total_prn', 
      label: 'Total PRN', 
      value: 8,
      chartData: generateGrowthTrend(6.5, 8),
      chartType: 'bar' as const,
      xAxisLabels,
      definition: "Total PRNs productive equivalent labor resources the organization actually pays for.",
      calculation: `Total PRN = PRN hours worked / Standard FTE hours

PRN staff characteristics:
• No guaranteed hours
• Work as needed/on-call
• Typically higher hourly rate
• Used for volume fluctuations and coverage`,
    },
  ], [xAxisLabels]);

  // Contractor-specific KPIs
  const contractorKPIs: KPIConfig[] = useMemo(() => [
    { 
      id: 'contractor_fte', 
      label: 'Contractor FTE', 
      value: 12.5,
      chartData: generateSeasonalTrend(12.5, 1.5),
      chartType: 'bar' as const,
      xAxisLabels,
      definition: "Total equivalent labor resources supplied by entities that are not Acute Ascension Hospitals, that are paid for and used by the organization.",
      calculation: `Total Contract Actual FTEs = Contract hours worked / Standard FTE hours

Includes:
• Travel nurses
• Agency staff
• Temporary contractors
Excludes: Regular staff, PRN staff`,
      breakdownData: [
        { skillType: 'RN', ftFtes: 8.0, ptFtes: 2.0, prnFtes: 0, totalActualPaidFtes: 10.0 },
        { skillType: 'Clinical Lead', ftFtes: 2.0, ptFtes: 0.5, prnFtes: 0, totalActualPaidFtes: 2.5 },
        { skillType: 'TOTAL', ftFtes: 10.0, ptFtes: 2.5, prnFtes: 0, totalActualPaidFtes: 12.5 },
      ],
    },
  ], [xAxisLabels]);

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
          breakdownData={kpi.breakdownData}
          xAxisLabels={kpi.xAxisLabels}
        />
      ))}
    </div>
  );
};
