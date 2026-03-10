

## Migrate Volume Settings to Patient Volume API

### Current State
The `SettingsTab` gets department list from **Supabase `departments` table** and historical analysis from **Supabase `labor_performance` table** via `useHistoricalVolumeAnalysis`. The override API (`/volume-overrides`) handles saving overrides only.

### What Needs to Change
The patient-volume API already returns all the base data per department: `concat_dept_name`, `department_id`, `business_unit`, `target_volume`, `max_expiry_date`, `total_valid_months`, `data_scenario`, `dly_avg_volume_3mth_low`, `dly_avg_volume_12mth`, etc. The Settings tab should use this as its source of truth instead of Supabase.

### Plan

**1. Pass region to `SettingsTab`** (in `StaffingSummary.tsx`)
- Add `selectedRegion` prop so the tab can filter patient-volume by region + facility.

**2. Rewrite `SettingsTab.tsx`**
- Remove Supabase `departments` query and `useHistoricalVolumeAnalysis` import.
- Import and call `usePatientVolume({ facility: selectedFacility, region: selectedRegion })` to get all department rows for the selected facility.
- Build `tableData` by mapping each `PatientVolumeRecord` to a `VolumeOverrideRow`:

| VolumeOverrideRow field | Source (PatientVolumeRecord) |
|---|---|
| `department_id` | `department_id` |
| `department_name` | `concat_dept_name` |
| `target_volume` | `target_volume` |
| `max_allowed_expiry_date` | `max_expiry_date` |
| `historical_months_count` | `total_valid_months` |
| `override_mandatory` | `total_valid_months < min_months_for_target` (use config) |
| `category` | derive from `data_scenario` or `total_valid_months` |
| `three_month_low_avg` | `dly_avg_volume_3mth_low` |
| `n_month_avg` | `dly_avg_volume_12mth` |
| `override_volume` | from override API (existing `useVolumeOverrides`) |
| `expiry_date` | from override API |

- Also map `edited_volume_override_value` and `edited_expiry_date` from patient-volume as fallback override data (the API returns the current override state too).
- Remove `useQuery` for facility details — use patient-volume record's `business_unit_description` instead.
- Loading state uses `isLoadingPatientVolume` instead of `isLoadingDepartments || isLoadingAnalysis`.
- Empty state checks `patientVolumeData.length` instead of `departments.length`.
- All Number() coercion applied since API returns strings.

**3. No changes to:**
- `useVolumeOverrides` (still used for saving/deleting overrides)
- `volumeOverrideColumns.tsx` (column config unchanged)
- `usePatientVolume.ts` (already has the right filters)

### Scope
- 2 files edited: `StaffingSummary.tsx` (add `selectedRegion` prop), `SettingsTab.tsx` (rewrite data source)

