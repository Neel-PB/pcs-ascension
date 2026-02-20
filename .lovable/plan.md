

## Fix Forecast Tour Tooltip Placement

### Problem
The tour tooltips in the Forecast section appear below (bottom) the KPI cards and table header, which can push content off-screen or feel awkward. The user wants all Forecast tour tooltips to consistently appear on top.

### File to Change

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Change `placement` from `'bottom'` to `'top'` for the first two forecast steps (lines 251 and 261). The third step already uses `'top'`. |

### Specific Changes

- **Line 251** (Forecast KPI Cards step): `placement: 'bottom'` to `placement: 'top'`
- **Line 261** (Forecast Table step): `placement: 'bottom'` to `placement: 'top'`
- **Line 271** (Expandable Detail View step): Already `'top'` -- no change needed

