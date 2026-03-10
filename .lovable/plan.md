

## Migrate NP Settings to Patient Volume API + PATCH /volume-overrides/upsert

### Current State
- **Department list**: Fetched from Supabase `departments` table
- **NP overrides**: Saved/deleted via Supabase `np_overrides` table
- **Facility details**: Fetched from Supabase `facilities` table

### What Changes

**1. `src/pages/staffing/StaffingSummary.tsx`** — Pass `selectedRegion` to `NPSettingsTab`

**2. `src/pages/staffing/NPSettingsTab.tsx`** — Rewrite data source
- Add `selectedRegion` prop
- Replace Supabase `departments` query with `usePatientVolume({ facility, region, market })`
- Remove Supabase `facilities` query — use patient-volume record's `business_unit_description`
- Remove `useHistoricalVolumeAnalysis` import
- Use `department_description` for clean department names
- Use `max_expiry_date` from patient-volume instead of hardcoded fiscal year end
- Keep existing staged-save workflow and stats logic

**3. `src/hooks/useNPOverrides.ts`** — Rewrite mutations to use NestJS API
- **Read**: Replace Supabase query with `GET /volume-overrides?businessUnit={facilityId}` (same endpoint as volume overrides — NP overrides go through the same API)
- **Upsert**: Replace Supabase insert/update with `PATCH /volume-overrides/upsert` sending `{ businessUnit, departmentId, region, market, volumeOverrideValue, expiryDate }`
- **Delete**: Replace Supabase delete with `DELETE /volume-overrides/:id`
- Map API response fields (camelCase) to frontend interface (snake_case), same pattern as `useVolumeOverrides.ts`

### No changes to
- `npOverrideColumns.tsx` (column config unchanged)
- `usePatientVolume.ts` (already has the right filters)

### Scope
3 files edited: `StaffingSummary.tsx`, `NPSettingsTab.tsx`, `useNPOverrides.ts`

