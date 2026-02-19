

## Make Tour More Elegant and Useful

### Changes Overview

1. **Remove tab preview wireframes** from all "Tab Navigation" steps -- the spotlight already highlights the real tabs, so the preview is redundant
2. **Remove repetitive "Tab Navigation" steps** from admin sub-tours -- every admin section starts with the same "Tab Navigation" step pointing at `[data-tour="admin-tabs"]`. Keep it only in the first section (Users). Same for Positions tours.
3. **Clean up unused components** from TourDemoPreview.tsx -- remove `TabPills`, `MiniChart`, `KPIInfo`, `KPIActions`, `CompactMiniChart`, `CompactDefinition`, `ExpandableRow`, `ForecastCards`, `TogglePair` if they are no longer referenced by any tour step
4. **Simplify text-only steps** -- steps that are just plain text (no preview) should be concise and action-oriented rather than verbose descriptions

---

### Detailed Changes

#### File: `src/components/tour/tourSteps.ts`

**Remove tab preview from "Tab Navigation" step (line 120-128):**
- Change from `demoContent('Switch between...', 'tab-pills')` to plain text `'Switch between Summary, Planned/Active Resources, Variance Analysis, Forecasts, and Settings views.'`
- This removes the TabPills wireframe since the spotlight already shows the real tabs

**Tighten verbose step descriptions across the file:**
- Shorten multi-sentence descriptions to 1-2 concise sentences where the UI is self-explanatory
- Example: "Use these cascading filters to narrow staffing data. Selecting a higher-level filter updates the options available in lower-level filters." becomes "Use cascading filters to narrow staffing data. Higher-level selections update lower-level options."

#### File: `src/components/tour/positionsTourSteps.ts`

**Remove duplicate "Tab Navigation" steps from Contractors and Requisitions tours (lines 86-91, 152-157):**
- The Employees tour already covers the tab navigation step
- When the tour auto-continues from Employees to Contractors, repeating "Tab Navigation" is redundant
- Keep only in `employeesTourSteps`

#### File: `src/components/tour/tourSteps.ts` (Admin sections)

**Remove duplicate "Tab Navigation" steps from admin sub-tours:**
- `adminFeedTourSteps` (lines 517-523): remove the admin-tabs step
- `adminRbacTourSteps` (lines 540-547): remove the admin-tabs step
- `adminAuditTourSteps` (lines 571-578): remove the admin-tabs step
- `adminSettingsTourSteps` (lines 596-602): remove the admin-tabs step
- Keep the tab navigation step only in `adminUsersTourSteps` (the first admin section)

#### File: `src/components/tour/TourDemoPreview.tsx`

**Remove unused components:**
- `TabPills` (lines 227-243) -- no longer used
- `MiniChart` (lines 93-180) -- replaced by KPICompactPreview
- `KPIInfo` (lines 182-197) -- replaced by KPICompactPreview
- `KPIActions` (lines 345-376) -- replaced by KPICompactPreview
- `CompactMiniChart` (lines 304-330) -- was only used inside KPIActions
- `CompactDefinition` (lines 332-343) -- was only used inside KPIActions
- `ExpandableRow` (lines 260-278) -- not referenced by any tour step
- `ForecastCards` (lines 280-291) -- not referenced by any tour step
- `TogglePair` (lines 293-302) -- not referenced by any tour step

Remove corresponding switch cases from the `TourDemoPreview` function.

Update the `TourDemoVariant` type to only include variants still in use: `'kpi-compact' | 'volume-colors' | 'split-badge' | 'legend'`

#### File: `src/components/tour/TourTooltip.tsx`

**Minor elegance refinements:**
- Add a subtle entrance animation to the card: `animate-in fade-in-0 zoom-in-[0.98] duration-200`
- Make the progress bar slightly taller on hover for interactivity feel: no change needed, current design is clean
- Make the section badge more visually distinct with a left border accent instead of full pill background

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Remove tab-pills preview from Tab Navigation step; remove duplicate admin tab steps from Feed, RBAC, Audit, Settings tours |
| `src/components/tour/positionsTourSteps.ts` | Remove duplicate Tab Navigation steps from Contractors and Requisitions tours |
| `src/components/tour/TourDemoPreview.tsx` | Remove 9 unused components (TabPills, MiniChart, KPIInfo, KPIActions, CompactMiniChart, CompactDefinition, ExpandableRow, ForecastCards, TogglePair); clean up type and switch |
| `src/components/tour/TourTooltip.tsx` | Add subtle entrance animation; refine section badge styling |

### Impact

- **Step count reduction**: Removes ~5 redundant "Tab Navigation" steps across the app
- **File size reduction**: Removes ~280 lines of unused component code from TourDemoPreview.tsx
- **Better UX**: No more showing a fake tab preview when the real tabs are already spotlighted; no repetitive steps when auto-continuing between sections

