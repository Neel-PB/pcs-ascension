import { generateLast12MonthLabels } from '@/lib/utils';

// Chart data generators
export const generateGrowthTrend = (start: number, end: number, points: number = 24) => 
  Array.from({ length: points }, (_, i) => ({
    value: i === points - 1 ? end : start + ((end - start) * i) / (points - 1) + (Math.random() - 0.5) * 2
  }));

export const generateDeclineTrend = (start: number, end: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: start - ((start - end) * i) / (points - 1) + (Math.random() - 0.5) * 2
  }));

export const generateVolatileTrend = (base: number, variance: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: base + Math.sin(i * 0.5) * variance + (Math.random() - 0.5) * (variance * 0.3)
  }));

export const generateSeasonalTrend = (base: number, amplitude: number, points: number = 24) =>
  Array.from({ length: points }, (_, i) => ({
    value: base + Math.sin((i / points) * Math.PI * 2) * amplitude + (Math.random() - 0.5) * 2
  }));

export interface KPIConfig {
  id: string;
  title: string;
  value: string;
  chartData: Array<{ value: number }>;
  chartType: 'line' | 'bar' | 'area';
  delay: number;
  definition: string;
  calculation: string;
  xAxisLabels?: string[];
  isHighlighted?: boolean;
  decimalPlaces?: number;
  breakdownData?: Array<{
    skillType: string;
    ftFtes: number;
    ptFtes: number;
    prnFtes: number;
    totalActualPaidFtes: number;
  }>;
}

// Shared FTE KPIs
export const getFTEKPIs = (): KPIConfig[] => {
  return [
    {
      id: 'vacancy-rate',
      title: "Vacancy Rate",
      value: "13.9%",
      chartData: generateDeclineTrend(16, 13.9),
      chartType: "bar",
      delay: 0,
      definition: "Vacancy Rate measures the percentage of Approved budgeted positions that are currently unfilled.",
      calculation: `Vacancy Rate = (Vacant Positions / Total Authorized Positions) × 100

Example: If you have 6 vacant positions and 43.4 total authorized positions:
(6 / 43.4) × 100 = 13.8%`,
    },
    {
      id: 'hired-ftes',
      title: "Hired FTEs",
      value: "40.9",
      chartData: generateGrowthTrend(37, 40.9),
      chartType: "bar",
      delay: 0.05,
      definition: "Total Full-time, Part-Time and PRNs equivalent labor resources currently employed by the organization (PRNs counted as 0.2 FTEs commitment).",
      calculation: `Hired FTEs = Sum of all active employee FTEs

Includes:
• Full-time staff (1.0 FTE each)
• Part-time staff (0.5, 0.8, etc.)
• Active employees only (excludes open positions)`,
      decimalPlaces: 1,
      breakdownData: [
        { skillType: 'RN', ftFtes: 22.0, ptFtes: 8.5, prnFtes: 2.4, totalActualPaidFtes: 32.9 },
        { skillType: 'Clinical Lead', ftFtes: 3.0, ptFtes: 1.5, prnFtes: 0.5, totalActualPaidFtes: 5.0 },
        { skillType: 'PCT', ftFtes: 2.0, ptFtes: 0.8, prnFtes: 0.2, totalActualPaidFtes: 3.0 },
        { skillType: 'TOTAL', ftFtes: 27.0, ptFtes: 10.8, prnFtes: 3.1, totalActualPaidFtes: 40.9 },
      ],
    },
    {
      id: 'target-ftes',
      title: "Target FTEs",
      value: "43.4",
      chartData: generateSeasonalTrend(43.4, 2),
      chartType: "area",
      delay: 0.1,
      definition: "The number of resources needed to meet budgeted staffing levels based on specific type and amount of Unit of Service.",
      calculation: `Target FTEs = (Expected Volume × Hours per Unit) / (Standard Hours per FTE × Expected Productivity %)

Determined by:
• Historical volume patterns
• Industry productivity benchmarks
• Department-specific standards`,
    },
    {
      id: 'fte-variance',
      title: "FTE Variance",
      value: "2.5",
      chartData: generateGrowthTrend(1.7, 2.5),
      chartType: "area",
      delay: 0.15,
      definition: "Variance between Hired FTEs and Target FTEs.",
      calculation: `FTE Variance = Hired FTEs - Target FTEs

Example: If target is 43.4 and hired is 40.9:
40.9 - 43.4 = -2.5 FTE shortage

A negative value indicates understaffing.`,
    },
    {
      id: 'open-reqs',
      title: "Open Reqs",
      value: "5",
      chartData: generateVolatileTrend(5, 2),
      chartType: "bar",
      delay: 0.2,
      definition: "The number of approved requisitions that have not yet been successfully filled.",
      calculation: `Open Requisitions = Count of all active job postings

Includes:
• Approved requisitions in recruiting
• Positions being screened/interviewed
• Offers extended but not yet accepted
Excludes: Filled positions, withdrawn postings`,
    },
    {
      id: 'req-variance',
      title: "Req Variance",
      value: "2.5",
      chartData: generateGrowthTrend(1.3, 2.5),
      chartType: "line",
      delay: 0.25,
      definition: "Variance between Hire FTEs plus Open Requisition and Target FTEs.",
      calculation: `Requisition Variance = FTE Variance - Open Requisitions

Example: If FTE Variance is 2.5 and Open Requisitions is 5:
2.5 - 5 = -2.5 (over-recruiting by 2.5 positions)`,
    },
  ];
};

// Shared Volume KPIs
export const getVolumeKPIs = (): KPIConfig[] => {
  const monthLabels = generateLast12MonthLabels();
  
  return [
    {
      id: '12m-monthly',
      title: "12M Average",
      value: "633.5",
      chartData: generateGrowthTrend(565, 633.5, 30),
      chartType: "area",
      delay: 0,
      xAxisLabels: monthLabels,
      definition: "Rolling 12-Month Average Monthly Volume.",
      calculation: `12M Avg Monthly = Sum of monthly volumes over 12 months / 12

Provides:
• Smoothed volume baseline
• Seasonal adjustment foundation
• Year-over-year comparison basis`,
    },
    {
      id: '12m-daily',
      title: "12M Daily Average",
      value: "20.8",
      chartData: generateGrowthTrend(19.8, 20.8, 30),
      chartType: "area",
      delay: 0.05,
      xAxisLabels: monthLabels,
      definition: "12-Month Average Daily Volume.",
      calculation: `12M Avg Daily = Total volume over 12 months / Total working days

Used for:
• Daily staffing calculations
• Shift planning
• Resource allocation`,
    },
    {
      id: '3m-low',
      title: "3M Low",
      value: "14.2",
      chartData: generateVolatileTrend(14.2, 3),
      chartType: "area",
      delay: 0.1,
      xAxisLabels: monthLabels,
      definition: "3-Month Average Lowest Volume for minimum staffing requirements.",
      calculation: `3M Avg Lowest = Average daily volume during the 3 lowest-volume months

Used for:
• Minimum staffing levels
• Core staff planning
• Base capacity requirements`,
    },
    {
      id: '3m-high',
      title: "3M High",
      value: "28.4",
      chartData: generateVolatileTrend(28.4, 5),
      chartType: "bar",
      delay: 0.15,
      xAxisLabels: monthLabels,
      definition: "3-Month Average Highest Volume for peak staffing requirements.",
      calculation: `3M Avg Highest = Average daily volume during the 3 highest-volume months

Used for:
• Peak staffing levels
• PRN/contract planning
• Surge capacity requirements`,
    },
    {
      id: 'target-vol',
      title: "Target Vol",
      value: "20.8",
      isHighlighted: true,
      chartData: generateSeasonalTrend(20.8, 3),
      chartType: "area",
      delay: 0.2,
      xAxisLabels: monthLabels,
      definition: "Target Volume for staffing calculations and planning.",
      calculation: `Target Volume = Forecasted daily volume based on historical data

Determined by:
• 12-month historical average
• Seasonal adjustment factors
• Strategic growth targets`,
    },
    {
      id: 'override-vol',
      title: "Override Vol",
      value: "24.7",
      chartData: generateVolatileTrend(24.7, 4),
      chartType: "bar",
      delay: 0.25,
      xAxisLabels: monthLabels,
      definition: "Manually adjusted volume target that supersedes calculated target.",
      calculation: `Override Volume = Manually entered volume target

Used when:
• Known upcoming service changes
• Special projects or initiatives
• Temporary capacity adjustments
• Market-specific factors not in historical data`,
    },
  ];
};

// Shared Productivity KPIs
export const getProductivityKPIs = (): KPIConfig[] => {
  return [
    {
      id: 'paid-ftes',
      title: "Paid FTEs",
      value: "38.2",
      chartData: generateGrowthTrend(35.8, 38.2),
      chartType: "bar",
      delay: 0,
      definition: "Total labor resources the organization actually pays for.",
      calculation: `Total Paid Actual FTEs = Total paid hours / Standard FTE hours

Includes:
• Regular hours
• Overtime hours
• All employment types`,
    },
    {
      id: 'contract-ftes',
      title: "Contract FTEs",
      value: "5.7",
      chartData: generateSeasonalTrend(5.7, 1.2),
      chartType: "bar",
      delay: 0.05,
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
    {
      id: 'overtime-ftes',
      title: "Overtime FTEs",
      value: "2.1",
      chartData: generateDeclineTrend(2.4, 2.1),
      chartType: "area",
      delay: 0.1,
      definition: "Total worked hours above regular (FT) commitment the organization actually pays for.",
      calculation: `Total Overtime FTEs = Total overtime hours / Standard FTE hours

Example: If 728 overtime hours worked in 2 weeks:
728 / (40 × 2) = 9.1 overtime FTE equivalent

Note: This is the volume equivalent, not cost equivalent`,
    },
    {
      id: 'total-prn',
      title: "Total PRN",
      value: "12.4",
      chartData: generateGrowthTrend(10.6, 12.4),
      chartType: "bar",
      delay: 0.15,
      definition: "Total PRNs productive equivalent labor resources the organization actually pays for.",
      calculation: `Total PRN = PRN hours worked / Standard FTE hours

PRN staff characteristics:
• No guaranteed hours
• Work as needed/on-call
• Typically higher hourly rate
• Used for volume fluctuations and coverage`,
    },
    {
      id: 'total-np',
      title: "Total NP%",
      value: "9.7%",
      chartData: generateGrowthTrend(8.1, 9.7),
      chartType: "area",
      delay: 0.2,
      definition: "Percentage of paid hours not spent on patient care.",
      calculation: `Total NP% = Total non-productive Man hours / Total Paid hours × 100

Non-productive hours include:
• PTO / Vacation
• Sick leave
• Training time
• Administrative duties`,
    },
    {
      id: 'total-fullpart-ftes',
      title: "Employed Productive FTEs",
      value: "35.3 / 5.6",
      chartData: generateGrowthTrend(33.8, 40.9),
      chartType: "bar",
      delay: 0.25,
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
  ];
};

// FTE Shortage KPI for Employees and Contractors tabs
export const getFTEShortageKPI = (): KPIConfig => {
  return {
    id: 'fte-shortage',
    title: 'FTE Shortage',
    value: '2.5',
    chartData: generateGrowthTrend(1.2, 2.5),
    chartType: 'area',
    delay: 0.3,
    definition: 'Forecasting positions to open for FTE shortage. This represents the gap between current staffing and target staffing levels.',
    calculation: `FTE Shortage = Target FTEs - (Hired FTEs + Open Requisitions)

Example: If target is 43.4, hired is 40.9, and open reqs is 5:
43.4 - 40.9 = 2.5 FTE shortage

A positive value indicates understaffing that needs to be addressed.`,
    decimalPlaces: 1,
    breakdownData: [
      { skillType: 'RN', ftFtes: 1.5, ptFtes: 0.5, prnFtes: 0, totalActualPaidFtes: 2.0 },
      { skillType: 'Clinical Lead', ftFtes: 0.3, ptFtes: 0.2, prnFtes: 0, totalActualPaidFtes: 0.5 },
      { skillType: 'TOTAL', ftFtes: 1.8, ptFtes: 0.7, prnFtes: 0, totalActualPaidFtes: 2.5 },
    ],
  };
};

// FTE Surplus KPI for Requisitions tab
export const getFTESurplusKPI = (): KPIConfig => {
  return {
    id: 'fte-surplus',
    title: 'FTE Surplus',
    value: '1.2',
    chartData: generateDeclineTrend(2.1, 1.2),
    chartType: 'area',
    delay: 0.3,
    definition: 'Forecasting positions to close for FTE surplus. This represents overstaffing relative to target staffing levels.',
    calculation: `FTE Surplus = Hired FTEs - Target FTEs

Example: If hired is 44.6 and target is 43.4:
44.6 - 43.4 = 1.2 FTE surplus

A positive value indicates overstaffing that may need reduction.`,
    decimalPlaces: 1,
    breakdownData: [
      { skillType: 'RN', ftFtes: 0.8, ptFtes: 0.2, prnFtes: 0, totalActualPaidFtes: 1.0 },
      { skillType: 'PCT', ftFtes: 0.1, ptFtes: 0.1, prnFtes: 0, totalActualPaidFtes: 0.2 },
      { skillType: 'TOTAL', ftFtes: 0.9, ptFtes: 0.3, prnFtes: 0, totalActualPaidFtes: 1.2 },
    ],
  };
};

// Get Volume KPI for workforce panel (with department context)
export const getVolumeKPIForWorkforce = (
  selectedDepartment: string | null | undefined,
  volumeType: 'target' | 'override' | null | undefined,
  volumeValue: number | null | undefined
): KPIConfig => {
  const monthLabels = generateLast12MonthLabels();
  
  return {
    id: 'volume',
    title: 'Volume',
    value: selectedDepartment && volumeValue ? String(volumeValue) : '',
    chartData: selectedDepartment ? generateSeasonalTrend(volumeValue || 20, 3) : generateSeasonalTrend(20, 3),
    chartType: 'area',
    delay: 0.3,
    xAxisLabels: monthLabels,
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
  };
};
