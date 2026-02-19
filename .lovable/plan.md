

## Fix All Tour Placement Issues and Enrich Consistency

### Problems Found

#### 1. Positions Demo-Content Steps Clipping (7 steps)
Steps with tall demo preview wireframes use `placement: 'bottom'`, pushing tooltips below the viewport. These target table cells on the right side of the table, so `'left'` keeps them visible.

#### 2. AdminTour Missing Spotlight Styling
`AdminTour.tsx` only has `borderRadius: 12` in its spotlight config -- missing the `padding: 6` and `boxShadow` glow ring that `StaffingTour`, `PositionsTour`, and `OverlayTour` all use. This makes Admin spotlights look inconsistent.

#### 3. Header Tour Steps Missing Explicit Placement
All 4 steps in `headerTourSteps.ts` have no `placement` property. Joyride defaults to `'bottom'` which works, but being explicit prevents future surprises and matches the pattern used everywhere else.

#### 4. Positions Demo Steps Missing `wideTooltip` Flag
The Active FTE, Shift Override, and Comments steps across Employees/Contractors/Requisitions contain demo preview content but lack `data: { wideTooltip: true }`, resulting in a narrower 480px tooltip trying to fit tall workflow wireframes.

---

### Detailed Changes

#### File: `src/components/tour/positionsTourSteps.ts`

Change `placement` from `'bottom'` to `'left'` and add `data: { wideTooltip: true }` on these steps:

| Tour | Step Target | Line |
|------|-------------|------|
| Employees | `positions-active-fte-cell` | 58 |
| Employees | `positions-shift-cell` | 65 |
| Employees | `positions-comments` | 72 |
| Contractors | `positions-active-fte-cell` | 117 |
| Contractors | `positions-shift-cell` | 124 |
| Contractors | `positions-comments` | 131 |
| Requisitions | `positions-comments` | 176 |

#### File: `src/components/tour/headerTourSteps.ts`

Add explicit `placement: 'bottom'` to all 4 steps (lines 5, 12, 18, 24).

#### File: `src/components/tour/AdminTour.tsx`

Add `padding: 6` and `boxShadow` to the `spotlight` style object to match Staffing/Positions/Overlay tours:

```typescript
spotlight: {
  borderRadius: 12,
  padding: 6,
  boxShadow: '0 0 0 2px hsl(var(--primary) / 0.3), 0 0 15px 4px hsl(var(--primary) / 0.1)',
},
```

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/positionsTourSteps.ts` | Change 7 demo-content steps from `placement: 'bottom'` to `'left'`; add `wideTooltip` flag |
| `src/components/tour/headerTourSteps.ts` | Add explicit `placement: 'bottom'` to all 4 steps |
| `src/components/tour/AdminTour.tsx` | Add missing spotlight `padding` and `boxShadow` to match other tours |

### What stays unchanged

- All existing scroll management, overflow restoration, and spotlight recalculation logic
- All demo preview components (PositionsDemoPreview, etc.)
- TourTooltip styling and animation (already refined)
- All Staffing, Forecast, Variance, Volume Settings, NP Settings, Feedback, AI Hub, and Checklist step placements (already correct)

