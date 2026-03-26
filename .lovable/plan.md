
Fix the Positions refresh timestamp in a more complete way.

What I found:
- `src/hooks/usePositionsByFlag.ts` already maps `row.load_ts`, but the refresh button in all 5 Positions tabs still reads only the first row:
  - `employees?.[0]?.curated_data_load_ts`
  - `requisitions?.[0]?.curated_data_load_ts`
  - etc.
- That means the button is wrong if:
  1. the first row has no timestamp, or
  2. the dataset is not ordered by newest load time.
- The normalizer is also less defensive than other API mappers in this codebase: it does not currently check camelCase timestamp keys like `loadTs`, `curatedDataLoadTs`, or `updatedAt`.

Implementation plan:
1. Update `src/hooks/usePositionsByFlag.ts`
   - Expand timestamp normalization to support both snake_case and camelCase:
   - `row.curated_data_load_ts ?? row.curatedDataLoadTs ?? row.load_ts ?? row.loadTs ?? row.updated_at ?? row.updatedAt`
   - Keep storing the result on `curated_data_load_ts` so the UI stays consistent.

2. Add a small shared helper for latest timestamp derivation
   - Create a utility that scans the full rows array, ignores null/invalid values, and returns the newest valid timestamp.
   - This keeps the logic reusable across all Positions tabs and avoids duplicating date parsing code 5 times.

3. Replace first-row timestamp usage in all Positions tabs
   - Update:
     - `src/pages/positions/EmployeesTab.tsx`
     - `src/pages/positions/OpenRequisitionTab.tsx`
     - `src/pages/positions/RequisitionsTab.tsx`
     - `src/pages/positions/ContractorsTab.tsx`
     - `src/pages/positions/ContractorRequisitionTab.tsx`
   - Compute `lastUpdated` from the full fetched dataset with `useMemo`, then pass that to `DataRefreshButton`.
   - This will use the latest timestamp already present in the fetched API data, with no extra requests.

4. Harden `src/components/dashboard/DataRefreshButton.tsx`
   - Add a validity check before formatting/parsing the date.
   - If the timestamp is invalid, treat it as unavailable instead of showing a misleading status or risking a date formatting error.

Technical note:
- The current bug is no longer just a `load_ts` mapping issue.
- The real UI problem is:
  ```text
  data exists
    -> first row chosen
    -> first row may not contain the newest timestamp
    -> refresh button shows wrong / empty value
  ```
- The fix should derive:
  ```text
  latest valid timestamp across active tab dataset
  ```
  not:
  ```text
  timestamp from row 0
  ```

Expected result:
- The refresh button will show the correct latest load time on:
  - Employee
  - Open Requisition
  - Open Position
  - Contractor
  - Contractor Requisition

QA to run after implementation:
- Verify the refresh popover on each of the 5 Positions tabs.
- Confirm the displayed timestamp matches the newest timestamp present in that tab’s fetched rows.
- Confirm empty datasets still show “No refresh data available”.
