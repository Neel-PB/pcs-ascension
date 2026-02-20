

## Fix: Forecast Tour Key Mismatch in User Guides

### Root Cause

In `src/components/support/UserGuidesTab.tsx` line 52, the guide catalog entry uses `tourKey: "staffing-forecast"` (no trailing **s**), but everywhere else in the codebase the key is `"staffing-forecasts"`:

- `tourStepRegistry.ts` -> `'staffing-forecasts': forecastSteps`
- `tourConfig.ts` -> `tourKey: 'staffing-forecasts'`
- `StaffingTour.tsx` -> `forecasts: 'staffing-forecasts'`

Because of this mismatch, `TOUR_STEP_REGISTRY["staffing-forecast"]` returns `undefined`, so the User Guides shows 0 steps (or 1 if a fallback fires) instead of the actual 3 forecast steps.

### Fix

**File: `src/components/support/UserGuidesTab.tsx`**, line 52

Change:
```
tourKey: "staffing-forecast"
```
to:
```
tourKey: "staffing-forecasts"
```

That single character fix will make the forecast guide correctly resolve its 3 steps from the registry.

### Files Changed

| File | Change |
|------|--------|
| `src/components/support/UserGuidesTab.tsx` | Fix `tourKey` from `"staffing-forecast"` to `"staffing-forecasts"` on line 52 |

