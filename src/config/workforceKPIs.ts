export interface WorkforceKPIConfig {
  id: string;
  title: string;
  definition: string;
  calculation: string;
  chartData?: Array<{ value: number }>;
  chartType?: "line" | "bar" | "area";
}

// Chart data generators
const generateGrowthTrend = (start: number, end: number, points = 12) =>
  Array.from({ length: points }, (_, i) => ({
    value: Math.round((start + ((end - start) * i) / (points - 1) + (Math.random() - 0.5) * 2) * 10) / 10
  }));

const generateFluctuatingTrend = (base: number, variance: number, points = 12) =>
  Array.from({ length: points }, () => ({
    value: Math.round((base + (Math.random() - 0.5) * variance) * 10) / 10
  }));

export const employeeKPIs: WorkforceKPIConfig[] = [
  {
    id: "hired_fte",
    title: "Hired FTEs",
    definition: "Total FTE count of all currently filled employee positions.",
    calculation: "Sum of FTE for positions where positionLifecycle = 'Filled' and not contingent.",
    chartData: generateGrowthTrend(35, 42),
    chartType: "bar",
  },
  {
    id: "vacancy_rate",
    title: "Vacancy Rate",
    definition: "Percentage of open positions relative to total positions.",
    calculation: "(Open Positions / Total Positions) × 100",
    chartData: generateFluctuatingTrend(12, 8),
    chartType: "line",
  },
  {
    id: "fte_variance",
    title: "FTE Variance",
    definition: "Difference between budgeted and actual FTE.",
    calculation: "Target FTE - Actual FTE",
    chartData: generateFluctuatingTrend(2, 4),
    chartType: "area",
  },
  {
    id: "open_reqs",
    title: "Open Reqs",
    definition: "Number of requisitions currently open for employees.",
    calculation: "Count of positions where positionLifecycle != 'Filled'",
    chartData: generateFluctuatingTrend(15, 10),
    chartType: "bar",
  },
  {
    id: "target_fte",
    title: "Target FTEs",
    definition: "The budgeted or planned FTE for the selected scope.",
    calculation: "Sum of target FTE from staffing standards.",
    chartData: generateGrowthTrend(40, 45),
    chartType: "line",
  },
];

export const contractorKPIs: WorkforceKPIConfig[] = [
  {
    id: "contract_fte",
    title: "Contract FTEs",
    definition: "Total FTE count of all currently active contractor positions.",
    calculation: "Sum of FTE for positions flagged as Contingent/Contractor.",
    chartData: generateGrowthTrend(8, 12),
    chartType: "bar",
  },
  {
    id: "contractor_pct",
    title: "Contractor %",
    definition: "Percentage of total workforce that is contractors.",
    calculation: "(Contractor FTE / Total FTE) × 100",
    chartData: generateFluctuatingTrend(18, 6),
    chartType: "line",
  },
  {
    id: "active_contracts",
    title: "Active Contracts",
    definition: "Number of contractors currently engaged.",
    calculation: "Count of unique contractor positions.",
    chartData: generateGrowthTrend(5, 10),
    chartType: "bar",
  },
  {
    id: "contract_variance",
    title: "Contract Variance",
    definition: "Difference between planned and actual contractor FTE.",
    calculation: "Planned Contract FTE - Actual Contract FTE",
    chartData: generateFluctuatingTrend(1, 3),
    chartType: "area",
  },
];

export const requisitionKPIs: WorkforceKPIConfig[] = [
  {
    id: "open_reqs",
    title: "Open Reqs",
    definition: "Total number of open requisitions awaiting fill.",
    calculation: "Count of positions where positionLifecycle != 'Filled'",
    chartData: generateFluctuatingTrend(20, 12),
    chartType: "bar",
  },
  {
    id: "pending_approval",
    title: "Pending Approval",
    definition: "Requisitions awaiting manager or HR approval.",
    calculation: "Count of requisitions with status = 'pending'",
    chartData: generateFluctuatingTrend(5, 4),
    chartType: "bar",
  },
  {
    id: "avg_days_open",
    title: "Avg Days Open",
    definition: "Average age of open requisitions.",
    calculation: "Sum of days open / Count of open requisitions",
    chartData: generateFluctuatingTrend(28, 15),
    chartType: "line",
  },
  {
    id: "req_variance",
    title: "Req Variance",
    definition: "Difference between planned and actual open requisitions.",
    calculation: "Expected open reqs - Actual open reqs",
    chartData: generateFluctuatingTrend(3, 5),
    chartType: "area",
  },
];

export function getKPIsForTab(tab: string): WorkforceKPIConfig[] {
  switch (tab) {
    case "employees":
      return employeeKPIs;
    case "contractors":
      return contractorKPIs;
    case "requisitions":
      return requisitionKPIs;
    default:
      return employeeKPIs;
  }
}
