

## Mutually Exclusive Active Highlight: Target Vol vs Override Vol

### Problem

Currently both Target Vol and Override Vol can show as highlighted simultaneously, or Target Vol is always highlighted. The correct behavior is:

- **Only one** card should have the green active highlight at a time
- If a valid (non-expired) override exists for the selected department, **Override Vol is active** (green) and Target Vol becomes neutral
- If no override exists (or it's expired), **Target Vol is active** (green) and Override Vol is neutral
- When no department is selected, Target Vol stays active and Override Vol shows "Select Dept"

### Change

**File: `src/pages/staffing/StaffingSummary.tsx`**

In the `volumeKPIs` useMemo, update the `isHighlighted` property for both cards:

1. **Target Vol card**: Set `isHighlighted: !overrideKpiData.isActive` -- only highlighted when there is NO active override
2. **Override Vol card**: Keep `isHighlighted: overrideKpiData.isActive` -- only highlighted when there IS an active override

This ensures exactly one card is green at any time.

### Logic Summary

```text
Department not selected:
  Target Vol   -> isHighlighted: true  (green, active)
  Override Vol -> isHighlighted: false (neutral, "Select Dept")

Department selected, NO valid override:
  Target Vol   -> isHighlighted: true  (green, active)
  Override Vol -> isHighlighted: false (neutral, "--")

Department selected, valid override exists:
  Target Vol   -> isHighlighted: false (neutral)
  Override Vol -> isHighlighted: true  (green, active)
```

### Files Changed

| File | Change |
|------|--------|
| `src/pages/staffing/StaffingSummary.tsx` | Add `isHighlighted: !overrideKpiData.isActive` to the `target-vol` KPI entry; keep `isHighlighted: overrideKpiData.isActive` on `override-vol` |

