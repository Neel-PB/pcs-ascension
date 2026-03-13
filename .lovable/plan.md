

## Update Variance Analysis Formula

### Change

In `src/pages/staffing/VarianceAnalysis.tsx`, lines 84-86, update the variance calculation:

**Current:** `target_fte - hired_fte - open_reqs_fte`
**New:** `hired_fte - target_fte + open_reqs_fte`

This applies to all three shift variants (day, night, total) in the `aggregateRecordsToVariance` function.

### File
- `src/pages/staffing/VarianceAnalysis.tsx` — 3 lines changed

