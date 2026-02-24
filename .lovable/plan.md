

## Two-Row Header Layout for All Position Tabs

### Overview
Apply the same two-row header pattern (already working in Employees tab) to the **Open Position**, **Contractor**, and remaining tabs. Each column will use a `flex-col` layout with either a total on the second row or an invisible placeholder for alignment.

### Totals by Tab

| Tab | Columns with Totals |
|-----|-------------------|
| Employee (done) | Employee Name (count), Hired FTE (sum), Active FTE (sum) |
| **Contractor** | Position # (count), Contractor Name (count), Hired FTE (sum), Active FTE (sum) |
| **Open Position** | Position # (count) |
| Open Requisition | No totals (placeholder tab with dummy data) |
| Contractor Requisition | No totals (placeholder tab with dummy data) |

---

### Changes

#### 1. `src/config/contractorColumns.tsx`

- Add a `ContractorTotals` interface similar to `EmployeeTotals`:
  ```ts
  export interface ContractorTotals {
    totalCount: number;
    totalContractorNames: number;
    totalHiredFTE: number;
    totalActiveFTE: number;
  }
  ```
- Update `createContractorColumnsWithComments` to accept an optional `totals` parameter
- Add two-row `renderHeader` to ALL columns:
  - `positionNum`: shows count total `(XXX)`
  - `employeeName`: shows contractor name count `(XXX)`
  - `FTE`: shows hired FTE sum
  - `actual_fte`: shows active FTE sum
  - All other columns (`jobTitle`, `shift`, `status`, `employmentType`, `comments`): invisible placeholder

#### 2. `src/pages/positions/ContractorsTab.tsx`

- Compute totals from the `contractors` data (count, sum of FTE, sum of actual_fte)
- Pass `totals` to `createContractorColumnsWithComments`

#### 3. `src/config/requisitionColumns.tsx`

- Add a `RequisitionTotals` interface:
  ```ts
  export interface RequisitionTotals {
    totalCount: number;
  }
  ```
- Update `createRequisitionColumnsWithComments` to accept optional `totals`
- Add two-row `renderHeader` to ALL columns:
  - `positionNum`: shows position count `(XXX)`
  - All other columns (`positionLifecycle`, `vacancyAge`, `jobTitle`, `shift`, `employmentType`, `comments`): invisible placeholder

#### 4. `src/pages/positions/RequisitionsTab.tsx` (Open Position tab)

- Compute `totalCount` from `filteredAndSortedRequisitions.length` (or full requisitions count)
- Pass `totals` to `createRequisitionColumnsWithComments`

### Files Changed
- `src/config/contractorColumns.tsx` -- add totals interface, two-row headers for all columns
- `src/pages/positions/ContractorsTab.tsx` -- compute and pass totals
- `src/config/requisitionColumns.tsx` -- add totals interface, two-row headers for all columns
- `src/pages/positions/RequisitionsTab.tsx` -- compute and pass totals

