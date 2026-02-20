

## Tour System Audit: Findings and Enhancement Plan

### 1. Missing Tour Coverage for 2 Position Tabs

The Positions page has 5 tabs (`employees`, `open-requisition`, `open-position`, `contractors`, `contractor-requisition`), but tours only exist for 3 of them:
- Employees (covered)
- Open Position / requisitions (covered)
- Contractors (covered)
- **Open Requisition** (MISSING)
- **Contractor Requisition** (MISSING)

The `APP_TOUR_SEQUENCE` and `TOUR_STEP_REGISTRY` only list 3 positions tours. The `PositionsTour` component only maps `employees`, `contractors`, and `requisitions` -- it does not handle `open-requisition` or `contractor-requisition` tabs at all.

**Fix:** Add tour step arrays for Open Requisition and Contractor Requisition tabs, register them in `tourConfig.ts`, `tourStepRegistry.ts`, `PositionsTour.tsx`, and `UserGuidesTab.tsx`.

---

### 2. Tab ID Mismatch in Tour Navigation

The `PositionsTour` component maps tab IDs `employees`, `contractors`, `requisitions` to tour keys. But the actual Positions page uses `open-position` as the tab ID for what the tour calls "requisitions". When the tour tries to auto-navigate between sections, the `requisitions` key in `tourConfig.ts` does not match the actual `open-position` tab ID -- so navigation from the tour launcher may not land on the correct tab.

**Fix:** Update `tourConfig.ts` to use `tab: 'open-position'` instead of `tab: 'requisitions'` for the Open Positions tour entry. Update `PositionsTour.tsx` to map `open-position` instead of `requisitions`.

---

### 3. Demo Previews Use Hardcoded Wireframes Instead of Actual App Screenshots

All tour demo previews (Position Details, Active FTE workflow, Shift Override, Comments, KPI cards, Variance table, Forecast table, Settings, etc.) are hand-coded wireframes with sample data. The user wants these to reflect the actual working application UI more closely.

**What needs updating:**
- **Position Details Preview** -- recently updated but still uses generic mock data. Could use more realistic field values that match the database.
- **Active FTE Steps Preview** -- the popover wireframe is a miniature recreation rather than a visual match of the actual `EditableFTECell` popover.
- **Shift Override Steps Preview** -- similarly hand-drawn rather than matching the actual `ShiftCell` UI.
- **Comments Preview** -- mock timeline, not matching the actual `PositionCommentSection` layout.

Since we cannot embed actual screenshots as images in the codebase easily, the approach is to make the wireframes pixel-accurate miniatures of the real components -- matching the same card styles (`bg-muted/50 rounded-xl`), field layouts, badge colors, and typography that the actual components use.

**Fix:** Audit each demo preview component against its real counterpart and update styling, layout, and data to match. Key files:
- `PositionsDemoPreview.tsx` -- compare against `EmployeeDetailsSheet.tsx`, `EditableFTECell`, `ShiftCell`, `PositionCommentSection`
- `TourDemoPreview.tsx` -- compare KPI cards against `KPICard.tsx`
- `SettingsDemoPreview.tsx` -- compare against `VolumeOverrideSettings.tsx` and `NPOverrideSettings`
- `ForecastDemoPreview.tsx` -- compare against `ForecastBalanceTable`
- `VarianceDemoPreview.tsx` -- compare against `VarianceAnalysis`
- `PlanningDemoPreview.tsx` -- compare against `PositionPlanning`

---

### 4. Inconsistent `disableScrollParentFix` Across Tour Components

- `StaffingTour`: `disableScrollParentFix` is set
- `PositionsTour`: `disableScrollParentFix` is set
- `AdminTour`: `disableScrollParentFix` is NOT set
- `OverlayTour`: `disableScrollParentFix` is set

This inconsistency can cause scroll jitter in the Admin tour.

**Fix:** Add `disableScrollParentFix` to `AdminTour.tsx`.

---

### 5. Inconsistent `disableOverlayClose` Setting

- `StaffingTour`: `disableOverlayClose={false}` (allows clicking overlay to close)
- `PositionsTour`: `disableOverlayClose` (prevents closing)
- `AdminTour`: `disableOverlayClose` (prevents closing)
- `OverlayTour`: `disableOverlayClose` (prevents closing)

Staffing tour allows closing by clicking the overlay while others do not.

**Fix:** Standardize to `disableOverlayClose` (true) across all tour components for consistency.

---

### 6. UserGuidesTab Missing 2 Position Guides

The guide catalog in `UserGuidesTab.tsx` only lists 3 positions guides (Employees, Contractors, Open Positions). Missing: Open Requisition and Contractor Requisition.

**Fix:** Add the 2 missing guide entries.

---

### 7. Tour Auto-Start on First Visit May Conflict

`useTour` auto-starts tours on first page visit (`autoStart: true` by default for page tours). If a user navigates to Staffing for the first time, the full 26-step Summary tour launches immediately. This could be overwhelming.

**Enhancement:** Consider disabling auto-start by default and relying solely on the header menu "Tour This Page" trigger. Or add a brief welcome prompt asking if the user wants a tour.

---

### 8. TourLauncher: Play Button Launches Tour but Reset Only Resets

Currently in the TourLauncher, clicking the action icon when completed calls `handleReset` which only clears the completion flag but does NOT re-launch the tour. The user has to then click the title to actually play it. This is a two-click operation that should be one click.

**Fix:** Make the reset icon both reset AND re-launch the tour in one action.

---

### Summary of Files to Change

| File | Changes |
|------|---------|
| `src/components/tour/tourConfig.ts` | Add 2 missing position tab entries, fix `requisitions` tab ID to `open-position` |
| `src/components/tour/tourStepRegistry.ts` | Register 2 new step arrays |
| `src/components/tour/positionsTourSteps.ts` | Add `openRequisitionTourSteps` and `contractorRequisitionTourSteps` arrays |
| `src/components/tour/PositionsTour.tsx` | Add mappings for `open-requisition` and `contractor-requisition` tabs, fix `requisitions` to `open-position` |
| `src/components/tour/AdminTour.tsx` | Add `disableScrollParentFix` |
| `src/components/tour/StaffingTour.tsx` | Set `disableOverlayClose` to true (remove `={false}`) |
| `src/components/tour/TourLauncher.tsx` | Make reset icon also re-launch the tour |
| `src/components/support/UserGuidesTab.tsx` | Add 2 missing guide catalog entries |
| `src/components/tour/PositionsDemoPreview.tsx` | Update all 4 preview variants to more closely match actual component styling |
| `src/components/tour/TourDemoPreview.tsx` | Audit KPI preview against real `KPICard` styling |
| `src/components/tour/SettingsDemoPreview.tsx` | Audit override cell previews against real cell components |
| `src/components/tour/ForecastDemoPreview.tsx` | Audit forecast previews against real `ForecastBalanceTable` |
| `src/components/tour/VarianceDemoPreview.tsx` | Audit variance previews against real variance table |
| `src/components/tour/PlanningDemoPreview.tsx` | Audit planning previews against real planning table |

### Priority Order

1. Fix tab ID mismatch (breaks navigation -- high priority)
2. Add missing Open Requisition and Contractor Requisition tours
3. Fix TourLauncher reset-and-play behavior
4. Standardize Joyride settings across all tour components
5. Update all demo previews to match actual app UI more closely

