

# Add Max Volume Validation to Override Volume Cell

## Summary
Add a `max_vol_patients` field from the patient-volume API to enforce a maximum value when users enter override volumes. Each department row will show a hint like "Not more than X" and prevent values outside the 0–max range.

## Changes

### 1. `src/hooks/usePatientVolume.ts` — Add field to interface
Add `max_vol_patients: number | null` to `PatientVolumeRecord` (around line 12–53).

### 2. `src/config/volumeOverrideColumns.tsx` — Add field to row type + pass to cell
- Add `max_vol_patients?: number | null` to `VolumeOverrideRow` interface.
- Pass `maxVolume={row.max_vol_patients}` to `OverrideVolumeCell` in the `override_volume` column renderer.

### 3. `src/components/editable-table/cells/OverrideVolumeCell.tsx` — Enforce validation
- Accept new prop `maxVolume?: number | null`.
- Add `min="0"` and `max={maxVolume}` attributes to the `<input>` element.
- In `handleAccept`, validate: if value < 0 or value > maxVolume, show a toast error and reject the save.
- Show a helper text below/beside the input: `"Max: {maxVolume}"` when in editing state and maxVolume is defined.

### 4. `src/pages/staffing/SettingsTab.tsx` — Map the field
In the `tableData` memo (around line 105–128), add:
```
max_vol_patients: record.max_vol_patients ?? null,
```

## Technical Details
- The `max_vol_patients` column comes from the NestJS `patient-volume` API response. If the backend doesn't yet return this field, rows will have `null` and no cap will be enforced (graceful fallback).
- Validation is both visual (input min/max attributes) and programmatic (checked in the accept handler with a toast message).
- The input will show a small muted hint text: "Max: X" when `maxVolume` is available.

## Files Modified
- `src/hooks/usePatientVolume.ts`
- `src/config/volumeOverrideColumns.tsx`
- `src/components/editable-table/cells/OverrideVolumeCell.tsx`
- `src/pages/staffing/SettingsTab.tsx`

