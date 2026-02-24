

## Put Search, KPI Cards, and Buttons on One Row

### Desired Layout
All three sections sit on a single horizontal row:
```text
[ Search ] [ Card ] [ Card ] [ Card ]  [ Refresh ] [ Filter ]
```

- Search on the left
- KPI cards in the middle
- Refresh + Filter buttons on the right
- All vertically centered on one line

### Changes

All 5 Position tab files get the same update -- merge the search field, KPI cards, and action buttons into a single `flex items-center` row:

```text
<div class="flex items-center gap-4">
  <SearchField class="w-64" />              <!-- fixed width, left -->
  <PositionKPICards items={...} />           <!-- fills middle -->
  <div class="flex gap-2 ml-auto">          <!-- pushed right -->
    <DataRefreshButton />
    <FilterButton />
  </div>
</div>
```

The `PositionKPICards` component already renders as a horizontal flex row of small cards, so it fits naturally inline.

### Files Changed
1. `src/pages/positions/EmployeesTab.tsx` -- merge 2 rows into 1
2. `src/pages/positions/ContractorsTab.tsx` -- same
3. `src/pages/positions/RequisitionsTab.tsx` -- same
4. `src/pages/positions/OpenRequisitionTab.tsx` -- same
5. `src/pages/positions/ContractorRequisitionTab.tsx` -- same
