

## Add Tour Guides for Volume Settings and NP Settings Tabs

### Overview
Add guided tours for the two settings tabs, following the same pattern used for Summary, Planning, Variance, and Forecasts. Both tabs share a similar UI structure (stats banner + editable table), so the tours will follow a consistent 3-step pattern.

### Volume Settings Tour (3 steps)

1. **Stats Banner** -- Targets the status summary bar. "This banner shows how many departments require an override, how many are using the calculated target volume, and how many overrides are expiring soon."
2. **Override Table** -- Targets the editable table. "Each row represents a department. Enter an override volume to replace the calculated target, then set an expiration date. Both are saved together. Use the Revert button to clear an override."
3. **Target Volume Popover** -- Targets the first target volume cell. "Click the target volume value to see historical analysis: the 3-month low average, N-month average, spread percentage, and a chart highlighting the lowest months."

### NP Settings Tour (3 steps)

1. **Stats Banner** -- Targets the status summary bar. "This banner shows how many NP overrides are active, expiring soon, or not yet set."
2. **Override Table** -- Targets the editable table. "Each row represents a department. The target NP% is fixed at 10% for all departments. Enter an override NP% and set an expiration date to apply a custom value."
3. **Two-Step Save** -- Targets the override column header area. "Overrides use a two-step save: enter a value (shown as Pending), then select an expiration date to commit both to the database."

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Add `volumeSettingsSteps: Step[]` (3 steps) targeting:
  - `[data-tour="volume-settings-stats"]`
  - `[data-tour="volume-settings-table"]`
  - `[data-tour="volume-settings-target"]`
- Add `npSettingsSteps: Step[]` (3 steps) targeting:
  - `[data-tour="np-settings-stats"]`
  - `[data-tour="np-settings-table"]`
  - `[data-tour="np-settings-override"]`

#### `src/pages/staffing/SettingsTab.tsx`
- Add `data-tour="volume-settings-stats"` on the stats banner div (line 240)
- Add `data-tour="volume-settings-table"` wrapper around the EditableTable (line 280)
- Add `data-tour="volume-settings-target"` on the first relevant table element (if accessible, otherwise on the table wrapper)

#### `src/pages/staffing/NPSettingsTab.tsx`
- Add `data-tour="np-settings-stats"` on the stats banner div (line 244)
- Add `data-tour="np-settings-table"` wrapper around the EditableTable (line 277)
- Add `data-tour="np-settings-override"` on the override column area

#### `src/components/tour/StaffingTour.tsx`
- Import `volumeSettingsSteps` and `npSettingsSteps`
- Extend the conditional logic:
  - `activeTab === 'volume-settings'` -> tourKey `'staffing-volume-settings'`, steps `volumeSettingsSteps`
  - `activeTab === 'np-settings'` -> tourKey `'staffing-np-settings'`, steps `npSettingsSteps`

