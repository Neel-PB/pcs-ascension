

## Fix Tooltip Placement and Final Polish

### Problem
The "FTE Skill Shift Analysis" tooltip has `placement: 'bottom'`, causing it to appear below the header bar and cover the table data. The same issue exists for "Variance Analysis" header step.

### Changes

#### 1. Fix placement on header-targeting steps (`tourSteps.ts`)

| Step | Line | Current | Change to |
|------|------|---------|-----------|
| FTE Skill Shift Analysis (`planning-header`) | 683 | `'bottom'` | `'top'` |
| Variance Analysis (`variance-header`) | 198 | `'bottom'` | `'top'` |

These are the only two "header" steps that incorrectly use `placement: 'bottom'`. All other steps already have correct placement (table steps use `'top'`, filter/toggle steps correctly use `'bottom'`).

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Change `placement` from `'bottom'` to `'top'` on lines 683 and 198 |

This is a small, targeted fix -- the two header steps were the only ones placing the tooltip below when they should go above.

