

## Fix Skill Mix Filter to Use `skillMix` Field

### Problem
The Skill Mix filter currently reads from `r.jobFamily` — both for populating dropdown options and for filtering. The user wants it to use `skillMix` (which the `usePositionsByFlag` normalizer sets from `row.skill_mix ?? row.skillMix`).

### Changes

**1. `src/components/positions/PositionsFilterSheet.tsx` (line 73)**
- Change filter comparison from `r.jobFamily` to `r.skillMix ?? r.skill_mix`

**2. All 5 tab files — update `skillMixOptions` extraction:**
- `EmployeesTab.tsx` — change `.map(e => e.jobFamily)` → `.map(e => (e as any).skillMix ?? (e as any).skill_mix)`
- `ContractorsTab.tsx` — same
- `RequisitionsTab.tsx` — same
- `OpenRequisitionTab.tsx` — same
- `ContractorRequisitionTab.tsx` — same

