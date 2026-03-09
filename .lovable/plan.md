

## Migrate Volume Settings to NestJS API

### Current State
The volume settings tab (`SettingsTab.tsx`) uses **direct Supabase calls** via `useVolumeOverrides.ts` for CRUD on the `volume_overrides` table. Your NestJS backend now has a full `volume-overrides` controller with endpoints for CRUD, comments, and expiry checks.

### Plan

**File: `src/hooks/useVolumeOverrides.ts`** — Rewrite all 3 hooks to call the NestJS API instead of Supabase:

1. **`useVolumeOverrides(facilityId)`** — `GET /volume-overrides?businessUnit={facilityId}` (or appropriate query params). Uses the same `API_BASE_URL` + MSAL token pattern as other hooks.

2. **`useUpsertVolumeOverride()`** — Two paths:
   - If override has an `id` (exists): `PUT /volume-overrides/:id` with `UpdateVolumeOverrideDto`
   - If new: `POST /volume-overrides` with `CreateVolumeOverrideDto`

3. **`useDeleteVolumeOverride()`** — `DELETE /volume-overrides/:id`

**File: `src/hooks/useVolumeOverrideComments.ts`** (new) — Add hooks for the comments API:
- `useVolumeOverrideComments(overrideId)` — `GET /volume-overrides/:id/comments`
- `useAddVolumeOverrideComment()` — `POST /volume-overrides/:id/comments`
- `useUpdateVolumeOverrideComment()` — `PATCH /volume-overrides/:id/comments/:commentId`
- `useDeleteVolumeOverrideComment()` — `DELETE /volume-overrides/:id/comments/:commentId`

**File: `src/hooks/useCheckExpiredOverrides.ts`** (new or update existing) — Call `POST /volume-overrides/check-expired` on session init.

### API Pattern (consistent with existing codebase)
```typescript
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const token = sessionStorage.getItem("msal_access_token");
const headers: Record<string, string> = { "Content-Type": "application/json" };
if (token) headers["Authorization"] = `Bearer ${token}`;
```

### What stays the same
- `SettingsTab.tsx` — No changes needed, it already consumes the hooks
- `useHistoricalVolumeAnalysis.ts` — Stays on Supabase (reads `labor_performance` for target calculation)
- `volumeOverrideColumns.tsx` — No changes
- The two-step staged save workflow (pending volume in memory → date picker → save) remains identical

### Key mapping: Frontend fields → API DTO
| Frontend | API (CreateVolumeOverrideDto) |
|----------|------------------------------|
| `facility_id` | `businessUnit` (confirm with your backend) |
| `department_id` | `departmentId` |
| `market` | `market` |
| `override_volume` | `overrideVolume` |
| `expiry_date` | `expiryDate` |

The exact DTO field names need to match your NestJS service. I'll need to confirm the `CreateVolumeOverrideDto` and `UpdateVolumeOverrideDto` field names — can you share the service/DTO definitions, or should I use the field names from the controller (`businessUnit`, `departmentId`, `region`, `market`)?

