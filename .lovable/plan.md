

## Migrate Volume Overrides to NestJS API

### Entity Field Mapping (Frontend → API)

Based on the TypeORM entity you shared:

| Frontend field | API field (camelCase) | DB column |
|---|---|---|
| `facility_id` | `businessUnit` | `business_unit` |
| `department_id` | `departmentId` | `department_id` |
| `market` | `market` | `market` |
| region (new) | `region` | `region` |
| `override_volume` | `volumeOverrideValue` | `volume_override_value` |
| `expiry_date` | `expiryDate` | `expiry_date` |
| — | `updatedBy` | `updated_by` |
| — | `commentsHistory` | `comments_history` (jsonb) |

Note: The entity has no `facility_name` or `department_name` columns — those are resolved from other data on the frontend.

### Files to Change

**1. `src/hooks/useVolumeOverrides.ts`** — Full rewrite from Supabase to NestJS API

- `useVolumeOverrides(facilityId)` → `GET /volume-overrides?businessUnit={facilityId}`
  - Maps response back to `VolumeOverride` interface (rename `volumeOverrideValue` → `override_volume`, `expiryDate` → `expiry_date`, etc.)
- `useUpsertVolumeOverride()` → Check for existing ID:
  - New: `POST /volume-overrides` with `{ businessUnit, departmentId, region, market, volumeOverrideValue, expiryDate }`
  - Update: `PUT /volume-overrides/:id` with `{ volumeOverrideValue, expiryDate }`
- `useDeleteVolumeOverride()` → `DELETE /volume-overrides/:id`
- Auth: MSAL token from `sessionStorage.getItem("msal_access_token")` in Authorization header
- Uses `VITE_API_BASE_URL` (same pattern as `useCheckExpiredFte`)

**2. `src/hooks/useVolumeOverrideComments.ts`** — New file for comment CRUD

- `useVolumeOverrideComments(overrideId)` → `GET /volume-overrides/:id/comments`
- `useAddVolumeOverrideComment()` → `POST /volume-overrides/:id/comments`
- `useUpdateVolumeOverrideComment()` → `PATCH /volume-overrides/:id/comments/:commentId`
- `useDeleteVolumeOverrideComment()` → `DELETE /volume-overrides/:id/comments/:commentId`

**3. `src/hooks/useCheckExpiredOverrides.ts`** — New file (mirrors `useCheckExpiredFte.ts` pattern)

- Calls `POST /volume-overrides/check-expired` once per session on load

**4. `src/pages/staffing/SettingsTab.tsx`** — Minor updates

- Add `region` to the upsert call (from facility data or filter context)
- Remove `facility_name` and `department_name` from the mutation payload (not in entity)

**5. `src/pages/staffing/StaffingSummary.tsx`** — No changes needed

- It reads `override_volume` and `expiry_date` from the hook response, which we'll map back to the same shape

### What stays the same
- `volumeOverrideColumns.tsx` — No changes (renders from `VolumeOverrideRow`)
- `useHistoricalVolumeAnalysis.ts` — Stays on Supabase
- Two-step staged save workflow unchanged
- `VolumeOverride` and `VolumeOverrideRow` interfaces keep same shape for consumers

### Key question before implementation
The `region` field is required in the entity's unique constraint. Where does the region come from in the current filter context? I see `facilities` table has a `region` column. I'll pull it from `facilityData.region` in `SettingsTab`.

