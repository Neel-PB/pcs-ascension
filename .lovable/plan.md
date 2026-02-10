

# Implement Staged Save Workflow for NP Settings (Matching Volume Settings)

## Overview

Replicate the Volume Settings two-step save workflow in the NP Settings tab:
1. Setting Override NP % stores the value in memory ("Pending" state) and auto-opens the Expiration Date picker
2. Selecting an Expiration Date commits both values to the database
3. A Revert button allows clearing committed overrides

## Changes Required

### 1. Update `NPOverrideRow` type in `src/config/npOverrideColumns.tsx`

Add a `pending_volume` field to the row interface (matching `VolumeOverrideRow`):

```tsx
export interface NPOverrideRow {
  // ... existing fields ...
  pending_volume?: number | null;
}
```

### 2. Refactor `npOverrideColumns.tsx` -- Override NP % column

Replace the `EditableNumberCell` with the `OverrideVolumeCell` component (same one Volume Settings uses). This gives us the idle/editing/saved states, badge indicator, and Revert button.

The column will pass `pending_volume` and `override_volume` similar to Volume Settings:
- Display value = `pending_volume ?? np_override_volume`
- `isPending` = whether `pending_volume` is set
- Revert calls `onDeleteOverride`

### 3. Refactor `npOverrideColumns.tsx` -- Expiration Date column

Add disabled state when no override and no pending value (matching Volume Settings pattern):
- If no `np_override_volume` and no `pending_volume`: show disabled dash with pencil icon
- Otherwise: show `EditableDateCell` with `autoOpen` and `onAutoOpenComplete` props

### 4. Refactor `npOverrideColumns.tsx` -- Status column

Add "Pending" status for rows with `pending_volume`:
- `pending_volume != null` -> amber "Pending" badge
- No override -> "Not Set" (secondary)
- Override without expiry -> "Incomplete" (amber)
- Expired / Expiring Soon / Active (existing logic stays)

### 5. Update column factory signature

```tsx
export const createNPOverrideColumns = (
  onSaveVolume: ...,
  onSaveDate: ...,
  onDeleteOverride: (departmentId: string) => Promise<void>,
  autoOpenDatePickerFor?: string | null,
  onAutoOpenComplete?: () => void
)
```

### 6. Update `src/pages/staffing/NPSettingsTab.tsx` -- Add staged save logic

Add state management matching `SettingsTab.tsx`:

- `pendingOverrides` state (`Record<string, number>`)
- `autoOpenDatePicker` state (`string | null`)
- `handleSaveVolume`: Store volume in `pendingOverrides`, set `autoOpenDatePicker` to department ID
- `handleAutoOpenComplete`: Clear `autoOpenDatePicker`
- `handleSaveDate`: Get volume from `pendingOverrides` or existing override, save both to DB, clear pending state
- `handleDeleteOverride`: Delete override from DB using `useDeleteNPOverride`
- Merge `pendingOverrides` into `tableData` as `pending_volume`
- Pass new params to `createNPOverrideColumns`

### 7. Update NP Override badge config

Since NP Settings doesn't have the mandatory/optional historical data logic, use a simpler badge:
- No override set: show a neutral badge (e.g., "Optional" with a shield icon)
- Override set: show the value with Revert button

## Files Modified

| File | Change |
|------|--------|
| `src/config/npOverrideColumns.tsx` | Add `pending_volume` to type, use `OverrideVolumeCell`, add disabled date state, add Pending/Incomplete status, update factory signature |
| `src/pages/staffing/NPSettingsTab.tsx` | Add `pendingOverrides` + `autoOpenDatePicker` state, staged save handlers, merge pending into table data, pass new column params |

## Result

Both Volume Settings and NP Settings will share identical user interaction patterns: edit override -> calendar auto-opens -> select date -> saved to DB. Revert button clears both values.
