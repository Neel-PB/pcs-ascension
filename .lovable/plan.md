

## Add Override Cell and Expiration Previews to Volume and NP Settings Tours

### Goal

Add new tour steps to both Volume Settings and NP Settings that visually demonstrate the override cell interaction states and the expiration date picker workflow. These will serve as step-by-step visual guides showing users exactly how to enter/edit values.

### New Preview Variants in `SettingsDemoPreview.tsx`

#### 1. `volume-override-steps` -- Override Volume Cell States

A visual walkthrough of the 3 cell states from `OverrideVolumeCell`:

```text
State 1: Idle
  [ --  ] [pencil icon]     "Click pencil to enter a value"

State 2: Editing
  [ 25.0  ] [checkmark] [X]  "Type value, press Enter or click checkmark"

State 3: Saved
  [ 25.0 ] [revert icon]    "Value saved. Click revert to clear."
```

Each state shown as a mini row with the actual icons (Pencil, Check, X, RotateCcw) and a short label. The "Mandatory" vs "Optional" badge also shown next to idle state to indicate when override is required.

#### 2. `volume-expiry-steps` -- Expiration Date Picker Flow

A visual showing the two-step staged save for Volume:

```text
Step 1: Enter override volume
  [input: 25.0] [checkmark] --> Status: "Pending"

Step 2: Date picker opens automatically
  +---------------------------+
  | Select a date             |
  |  < February 2026 >        |
  |  [calendar grid mini]     |
  |  [CANCEL]     [OK]        |
  +---------------------------+
  --> Status: "Active"

Revert: Clears both volume and expiration
```

Shows a simplified calendar wireframe matching the Helix date picker pattern (header, mini grid, Cancel/OK footer).

#### 3. `np-override-steps` -- Override NP% Cell States

Same pattern as volume but for NP%:

```text
State 1: Idle
  [ --  ] [pencil icon]     "Click pencil to enter NP%"

State 2: Editing
  [ 12%  ] [checkmark] [X]  "Enter percentage value"

State 3: Pending (value stored locally, not yet committed)
  [ 12% ] [pencil icon]     "Pending -- awaiting expiration date"
```

Key difference from volume: the NP cell shows "Pending" state (not "Saved") because the value is stored in memory until the expiration date is selected.

#### 4. `np-expiry-steps` -- NP Expiration Date Picker Flow

Same calendar wireframe pattern but emphasizing the NP-specific behavior:

```text
Step 1: Enter Override NP%
  [input: 12%] --> stored in memory as "Pending"

Step 2: Date picker opens automatically
  +---------------------------+
  | Select a date             |
  | Max expiry: Jun 30, 2026  |
  |  < March 2026 >           |
  |  [calendar grid mini]     |
  |  [CANCEL]     [OK]        |
  +---------------------------+
  --> Both NP% and date committed to database
  --> Status: "Active"

Revert: Clears both NP% and expiration from database
```

Includes the "Max expiry" constraint label unique to NP settings.

### Updated Tour Steps

#### Volume Settings (3 steps --> 5 steps)

| # | Step | Target | Preview |
|---|------|--------|---------|
| 1 | Status Summary | `volume-settings-stats` | `volume-stats-preview` (existing) |
| 2 | Override Table | `volume-settings-table` | `volume-table-preview` (existing) |
| 3 | Override Cell Interaction | `volume-settings-table` | `volume-override-steps` (NEW) |
| 4 | Expiration Date Flow | `volume-settings-table` | `volume-expiry-steps` (NEW) |
| 5 | Target Volume Details | `volume-settings-target` | `volume-target-preview` (existing) |

#### NP Settings (3 steps --> 5 steps)

| # | Step | Target | Preview |
|---|------|--------|---------|
| 1 | Status Summary | `np-settings-stats` | `np-stats-preview` (existing) |
| 2 | Override Table | `np-settings-table` | `np-table-preview` (existing) |
| 3 | Override NP% Interaction | `np-settings-table` | `np-override-steps` (NEW) |
| 4 | Expiration Date Flow | `np-settings-table` | `np-expiry-steps` (NEW) |
| 5 | Two-Step Save Summary | `np-settings-override` | `np-two-step-preview` (existing) |

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/SettingsDemoPreview.tsx` | Add 4 new variants: `volume-override-steps`, `volume-expiry-steps`, `np-override-steps`, `np-expiry-steps` with cell-state wireframes and calendar picker mockups |
| `src/components/tour/tourSteps.ts` | Insert 2 new steps into `volumeSettingsSteps` (between table and target) and 2 new steps into `npSettingsSteps` (between table and two-step) |

### Design Details

- Override cell states use real icons from the app (Pencil, Check, X, RotateCcw) rendered at preview scale
- Calendar wireframe shows the Helix-spec layout: "Select a date" header, month navigation, mini grid placeholder, and CANCEL/OK footer buttons
- Status badges reuse the existing `volStatusBadge` helper (Pending = amber, Active = primary, Not Set = muted)
- Connecting arrows between states use vertical border lines (same pattern as `np-two-step-preview`)

