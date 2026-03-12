

## Add Position Lifecycle Status Filter to Employee and Open Requisition Tabs

### What changes

Add a "Position Lifecycle Status" dropdown filter to the shared `PositionsFilterSheet`, visible only on the Employee and Open Requisition tabs. Options are dynamically extracted from the loaded dataset (same pattern as Skill Mix).

### Files to change

**1. `src/hooks/usePositionsByFlag.ts`** (~line 12-39)
- Add `positionLifecycle` to the normalizer to handle both camelCase and snake_case from the API:
```typescript
positionLifecycle: row.positionLifecycle ?? row.position_lifecycle,
```

**2. `src/components/positions/PositionsFilterSheet.tsx`**
- Add `positionLifecycle: string` to `PositionsFilterValues` interface and default to `"all"`
- Add new prop `showLifecycle?: boolean` and `lifecycleOptions: string[]`
- Add lifecycle filter counting in `getActiveFilterCount`
- Add lifecycle filtering in `applyPositionFilters` (filter on `r.positionLifecycle`)
- Add a "Position Lifecycle Status" `<Select>` dropdown (conditionally rendered when `showLifecycle` is true)

**3. `src/pages/positions/EmployeesTab.tsx`**
- Extract unique `positionLifecycle` values from `employees` data
- Pass `showLifecycle={true}` and `lifecycleOptions={lifecycleOptions}` to `PositionsFilterSheet`
- Update `getActiveFilterCount` call to include lifecycle

**4. `src/pages/positions/OpenRequisitionTab.tsx`**
- Same as EmployeesTab: extract lifecycle options, pass `showLifecycle` and `lifecycleOptions` to the filter sheet

### Pattern
Follows the exact same pattern as the existing `showStatus` conditional filter — a boolean prop controls visibility, options are dynamically derived from data, and filtering applies client-side via `applyPositionFilters`.

