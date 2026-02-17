

## Add Volume Config Tour Steps to Admin Settings Guide

### Problem
The Admin Settings tour only has 3 generic steps (Tab Navigation, Settings Sub-Tabs, Settings Content). It does not include any steps specific to the Volume Config sub-tab, so users get no guided walkthrough of the volume override configuration features.

### Solution
Add Volume Config-specific tour steps to `adminSettingsTourSteps` and place corresponding `data-tour` attributes on key elements in `VolumeOverrideSettings.tsx`.

### Technical Changes

#### 1. `src/components/admin/VolumeOverrideSettings.tsx`
Add `data-tour` attributes to four key elements:
- **Mode toggle** (Universal/Department tabs, ~line 357): `data-tour="volume-config-mode"`
- **Rule Matrix Preview** (collapsible card, ~line 468): `data-tour="volume-config-matrix"`
- **Rule Thresholds + Fiscal cards** (grid container, ~line 528): `data-tour="volume-config-fields"`
- **Save button** (~line 705): `data-tour="volume-config-save"`

#### 2. `src/components/tour/tourSteps.ts`
Add 4 new steps to `adminSettingsTourSteps` after the existing 3 steps:

| Step | Target | Title | Content |
|------|--------|-------|---------|
| 4 | `volume-config-mode` | Scope Mode | Choose Universal to set rules for all departments, or Department-Specific to create custom overrides for individual departments. |
| 5 | `volume-config-matrix` | Rule Matrix Preview | Expand this card to see how your threshold settings translate into override requirements based on historical data availability. |
| 6 | `volume-config-fields` | Configuration Fields | Left: set rule thresholds (min months, spread %). Right: configure fiscal year, volume floor, and backfill settings. |
| 7 | `volume-config-save` | Save Changes | Click Save to commit your configuration. For Department-Specific mode, select a Market, Facility, and Department before saving. |

All new steps use `placement: 'auto'` and `disableBeacon: true`.

### Notes
- The existing 3 steps remain unchanged; the Volume Config steps are appended after them.
- Since the Settings tab defaults to "UI Settings", the tour will first highlight the sub-tab toggle (step 2), giving users context before the Volume Config steps appear. The tour's `step:before` scroll behavior (from the existing `handleCallback`) will scroll Volume Config elements into view as needed.
