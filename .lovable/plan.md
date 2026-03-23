

## Fix 401 Errors: Replace `msal_access_token` with `nestjs_token`

### Problem
After migrating auth from MSAL to NestJS, all data-fetching hooks still read `sessionStorage.getItem("msal_access_token")` for the Bearer token. The login flow stores the token as `nestjs_token`, so these hooks send no Authorization header → 401 Unauthorized.

### Solution
Replace every occurrence of `msal_access_token` with `nestjs_token` across all hooks that call the NestJS API.

### Files Changed (16 files)
- `src/hooks/useSkillShift.ts`
- `src/hooks/usePatientVolume.ts`
- `src/hooks/useProductiveResourcesKpi.ts`
- `src/hooks/useEmploymentSplit.ts`
- `src/hooks/useFilterData.ts`
- `src/hooks/usePositionsByFlag.ts`
- `src/hooks/useNPOverrides.ts`
- `src/hooks/useVolumeOverrides.ts`
- `src/hooks/useVolumeOverrideComments.ts`
- `src/hooks/useUpdateActualFte.ts`
- `src/hooks/useUpdateShiftOverride.ts`
- `src/hooks/useCheckExpiredFte.ts`
- `src/hooks/useCheckExpiredOverrides.ts`
- `src/hooks/usePositionComments.ts`
- `src/hooks/useRegionVolumeData.ts` (if applicable)
- `src/hooks/useHistoricalVolumeAnalysis.ts` (if applicable)

Each file: change `sessionStorage.getItem("msal_access_token")` → `sessionStorage.getItem("nestjs_token")`

Also keep the cleanup of `msal_access_token` in `signOut` (AuthContext) for backwards compatibility with any lingering sessions.

