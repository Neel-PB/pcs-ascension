export interface WorkforceKPIConfig {
  id: string;
  title: string;
  definition: string;
  calculation: string;
}

export const employeeKPIs: WorkforceKPIConfig[] = [
  {
    id: "hired_fte",
    title: "Hired FTEs",
    definition: "Total FTE count of all currently filled employee positions.",
    calculation: "Sum of FTE for positions where positionLifecycle = 'Filled' and not contingent.",
  },
  {
    id: "vacancy_rate",
    title: "Vacancy Rate",
    definition: "Percentage of open positions relative to total positions.",
    calculation: "(Open Positions / Total Positions) × 100",
  },
  {
    id: "fte_variance",
    title: "FTE Variance",
    definition: "Difference between budgeted and actual FTE.",
    calculation: "Target FTE - Actual FTE",
  },
  {
    id: "open_reqs",
    title: "Open Reqs",
    definition: "Number of requisitions currently open for employees.",
    calculation: "Count of positions where positionLifecycle != 'Filled'",
  },
  {
    id: "target_fte",
    title: "Target FTEs",
    definition: "The budgeted or planned FTE for the selected scope.",
    calculation: "Sum of target FTE from staffing standards.",
  },
];

export const contractorKPIs: WorkforceKPIConfig[] = [
  {
    id: "contract_fte",
    title: "Contract FTEs",
    definition: "Total FTE count of all currently active contractor positions.",
    calculation: "Sum of FTE for positions flagged as Contingent/Contractor.",
  },
  {
    id: "contractor_pct",
    title: "Contractor %",
    definition: "Percentage of total workforce that is contractors.",
    calculation: "(Contractor FTE / Total FTE) × 100",
  },
  {
    id: "active_contracts",
    title: "Active Contracts",
    definition: "Number of contractors currently engaged.",
    calculation: "Count of unique contractor positions.",
  },
  {
    id: "contract_variance",
    title: "Contract Variance",
    definition: "Difference between planned and actual contractor FTE.",
    calculation: "Planned Contract FTE - Actual Contract FTE",
  },
];

export const requisitionKPIs: WorkforceKPIConfig[] = [
  {
    id: "open_reqs",
    title: "Open Reqs",
    definition: "Total number of open requisitions awaiting fill.",
    calculation: "Count of positions where positionLifecycle != 'Filled'",
  },
  {
    id: "pending_approval",
    title: "Pending Approval",
    definition: "Requisitions awaiting manager or HR approval.",
    calculation: "Count of requisitions with status = 'pending'",
  },
  {
    id: "avg_days_open",
    title: "Avg Days Open",
    definition: "Average age of open requisitions.",
    calculation: "Sum of days open / Count of open requisitions",
  },
  {
    id: "req_variance",
    title: "Req Variance",
    definition: "Difference between planned and actual open requisitions.",
    calculation: "Expected open reqs - Actual open reqs",
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
