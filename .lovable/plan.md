

# Fix Filter Flickering Between Staffing and Positions

## Problem

When navigating between Staffing and Positions, the entire page unmounts and remounts. Since both pages store filter state locally (via `useState`), all filter values reset and the initialization flow reruns:

1. `filtersInitialized` resets to `false`
2. The loading guard shows a LogoLoader while `useOrgScopedFilters` re-initializes
3. FilterBar re-mounts from scratch, replaying any entrance animations
4. Filter dropdowns briefly show defaults before settling

Both modules share the **same FilterBar** with the same cascading filters (Region > Market > Facility > Department), so this re-initialization is unnecessary.

## Solution: Shared Filter Store (Zustand)

Create a Zustand store that holds the filter state and initialization flag. Both StaffingSummary and PositionsPage read from and write to this single store. When navigating between them, the store retains its values so:

- No loading guard flashes (filters are already initialized)
- FilterBar renders immediately with the current selections
- Only the tab navigation and content area change

## Changes

### 1. New file: `src/stores/useFilterStore.ts`

A Zustand store with:
- All filter values (`selectedRegion`, `selectedMarket`, `selectedFacility`, `selectedDepartment`, `selectedSubmarket`, `selectedPstat`, `selectedLevel2`)
- `filtersInitialized` flag
- Setter actions for each filter, including cascade resets (e.g., changing region resets market, facility, department)
- A `clearFilters` action that accepts Access Scope defaults
- An `initializeFromDefaults` action that applies org-scoped defaults (only runs once)

### 2. Update `src/pages/staffing/StaffingSummary.tsx`

- Remove all local `useState` calls for filter values
- Remove the `filtersInitialized` state and the `useEffect` that initializes filters
- Import and use `useFilterStore` instead
- The `isInitializing` guard now checks `!filtersInitialized` from the store (which persists across navigation)
- Keep all KPI logic, tabs, and content rendering as-is

### 3. Update `src/pages/positions/PositionsPage.tsx`

- Same changes: replace local filter `useState` with `useFilterStore`
- Remove the initialization `useEffect`
- The `isInitializing` guard uses the store's `filtersInitialized`

### 4. No changes to FilterBar

FilterBar remains a controlled component receiving values via props. The only difference is where those props come from (store instead of local state).

## What the user will see

- First page load: filters initialize once from Access Scope defaults (same as today)
- Navigating Staffing to Positions (or back): filters stay exactly where they were, no loader flash, no re-animation
- Tab toggle and content area still transition normally
- Clearing filters still respects Access Scope defaults

## Technical Details

```text
Before (local state):
  /staffing -> mount StaffingSummary -> useState x7 -> useEffect init -> render FilterBar
  /positions -> unmount StaffingSummary -> mount PositionsPage -> useState x7 -> useEffect init -> render FilterBar
  (every navigation = full reset)

After (shared store):
  /staffing -> mount StaffingSummary -> read useFilterStore -> render FilterBar
  /positions -> unmount StaffingSummary -> mount PositionsPage -> read useFilterStore (same values) -> render FilterBar
  (navigation = instant, no reset)
```

### Files to create
- `src/stores/useFilterStore.ts`

### Files to modify
- `src/pages/staffing/StaffingSummary.tsx` (replace local state with store)
- `src/pages/positions/PositionsPage.tsx` (replace local state with store)

