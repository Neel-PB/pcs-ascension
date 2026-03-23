

## Prevent Unscoped API Calls Before Filter Defaults Are Applied

### Problem
The data-fetching hooks (`usePatientVolume`, `useSkillShift`, `useProductiveResourcesKpi`, `useEmploymentSplit`) fire immediately with default "all-X" values before `initializeFromDefaults` runs. This causes an initial unscoped API call (e.g., `skill-shift?take=50000` with no region filter), followed by a second correctly-scoped call once defaults apply. For the current admin user (Region 1, markets Illinois + Tennessee), this means the first call returns ALL system data.

### Root Cause
In `StaffingSummary.tsx`, the hooks run unconditionally. The `filtersInitialized` flag from the store is `false` initially, but the hooks don't check it — they just use whatever `selectedRegion` etc. currently holds (`"all-regions"` by default).

### Solution
Pass `enabled: filtersInitialized` to each data hook so they only fire after access scope defaults have been applied to the filter store. This eliminates the wasteful unscoped first call entirely.

### Changes

#### 1. `src/hooks/usePatientVolume.ts`
Add an optional `enabled` flag to the hook. When `false`, pass `enabled: false` to `useQuery` so it doesn't fire.

#### 2. `src/hooks/useProductiveResourcesKpi.ts`
Same — add `enabled` option.

#### 3. `src/hooks/useSkillShift.ts`
Same — add `enabled` option.

#### 4. `src/hooks/useEmploymentSplit.ts`
Same — add `enabled` option.

#### 5. `src/pages/staffing/StaffingSummary.tsx` (lines 142-182)
Pass `enabled: filtersInitialized` (or `enabled: filtersInitialized && orgScopedReady`) to each data hook call so they wait for defaults to be applied before fetching.

### Result
- No unscoped API calls on load
- Data only fetches once filters are properly initialized with access scope defaults
- User with Region 1 + 2 markets: first and only call includes `region=Region+1`

### Files Changed
- `src/hooks/usePatientVolume.ts`
- `src/hooks/useProductiveResourcesKpi.ts`
- `src/hooks/useSkillShift.ts`
- `src/hooks/useEmploymentSplit.ts`
- `src/pages/staffing/StaffingSummary.tsx`

