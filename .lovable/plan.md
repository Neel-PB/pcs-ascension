

## Fix Productive Resources KPI for Day-of-Week Data Structure

The API now returns 7 rows per department (one per `day_of_week`). The current code deduplicates by `market_hierarchy_key|department_id`, keeping only 1 arbitrary day — causing incorrect "random" numbers.

### Root Causes
1. **Dedup logic** drops 6 of 7 rows per department
2. **Interface** doesn't include the new `day_of_week` column
3. **Aggregations** don't account for the 7-day structure

### Aggregation Rules (per user spec)
- **Additive FTEs** (`paid_fte`, `contractor_fte`, `overtime_fte`, `employed_productive_fte`, `total_prn`): **SUM** across all 7 days
- **`target_fte`** (department constant repeated per day): **SUM** across 7 days to get dept-level total
- **NP%** (non-additive ratio): Use **weighted formula** — `SUM(np% × paid_fte) / SUM(paid_fte)` (already implemented correctly in `prAgg`)

### Changes

**1. `src/hooks/useProductiveResourcesKpi.ts`**
- Add `day_of_week: string | number` to the `ProductiveResourcesKpiRecord` interface
- Update dedup key from `market_hierarchy_key|department_id` to `market_hierarchy_key|department_id|day_of_week` so all 7 day-rows are kept

**2. `src/pages/staffing/StaffingSummary.tsx`**
- **`prAgg` memo (lines 183-197)**: No structural change needed — it already SUMs all additive FTEs and uses weighted NP%. With dedup fix, it will now correctly sum across all 7 days.
- **`paidByDept` memo (lines 271-294)**: Same — already SUMs by department. With 7 rows per dept now included, sums will be correct.
- **`npByDept` memo (lines 297-318)**: Same — already uses weighted NP formula. Will work correctly once all 7 rows flow through.
- **`nonNursingTarget` memo (lines 321-329)**: Same — already SUMs `target_fte`. With all 7 day-rows, the sum gives the correct dept-level weekly total.

### Summary
The fix is primarily in the **dedup key** in the hook — once all 7 day-rows pass through, the existing aggregation logic (SUM for additive, weighted for NP%) already produces correct results. Two lines changed total: one interface field addition, one dedup key update.

