

# Enhance Access Scope Manager with Cascading Searchable Filters

## Goal
Update the Access Scope section in the Edit User form to use cascading, searchable filters that follow the same pattern as the global FilterBar. This means:
- Region → Market → Facility → Department cascade (selecting a region limits markets, etc.)
- Facility and Department dropdowns are searchable with the two-column layout (Name + ID)
- Same selection styling (background color, no checkmarks)

---

## Current State

The `AccessScopeManager` component currently:
- Uses `MultiSelectChips` for each level (Region, Market, Facility, Department)
- Shows ALL options at each level independently (no cascading)
- Uses checkbox-based multi-select in a popover
- Selected items appear as Badge chips

---

## Proposed Changes

### 1. Add Cascading Logic

Filter options at each level based on selections at parent levels:
- **Markets**: Show only markets in selected regions (or all if no region selected)
- **Facilities**: Show only facilities in selected markets (or cascade from regions)
- **Departments**: Show only departments in selected facilities (or cascade from markets/regions)

### 2. Update Facility Multi-Select to Searchable Two-Column Layout

Replace the current `MultiSelectChips` for Facility with a custom searchable popover that:
- Uses `Popover + Command` pattern for search
- Shows Name + ID in a two-column grid layout (`grid-cols-[minmax(0,1fr)_80px]`)
- Allows multi-select (checkboxes)
- Uses `bg-primary/15` + `border-primary/30` for selected items
- No checkmark icons in the list

### 3. Update Department Multi-Select Similarly

Apply the same searchable two-column pattern to Department:
- Searchable by name and ID
- Two-column layout with divider
- Same selection styling

### 4. Keep Region and Market as Simple Searchable Multi-Selects

Region and Market don't need the two-column layout (no IDs), but should:
- Be searchable
- Follow the same selection styling (bg-primary/15, no checkmark icons)

---

## Technical Implementation

### File: `src/components/admin/AccessScopeManager.tsx`

**Changes:**
1. Import additional components: `Popover`, `PopoverContent`, `PopoverTrigger`, `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `ChevronsUpDown`
2. Add cascading logic to filter options based on parent selections
3. Replace `MultiSelectChips` for Facility with custom searchable Popover
4. Replace `MultiSelectChips` for Department with custom searchable Popover
5. Update Region and Market `MultiSelectChips` to remove checkmark icons (via styling updates)

### File: `src/components/ui/multi-select-chips.tsx`

**Changes:**
1. Remove the `Check` icon from the dropdown list items
2. Keep only the background color (`bg-primary/15`) to indicate selection
3. This matches the global filter styling

---

## Cascading Logic Summary

```text
Selected Regions → Filter Markets (show only markets in those regions)
                   ↓
Selected Markets → Filter Facilities (show only facilities in those markets)
                   ↓
Selected Facilities → Filter Departments (show only departments in those facilities)
```

If no parent is selected, show all options at that level.

---

## Visual Changes

| Component | Before | After |
|-----------|--------|-------|
| Region | Multi-select chips with checkboxes | Searchable multi-select, bg highlight, no checkmarks |
| Market | Multi-select chips with checkboxes | Filtered by Region, searchable, bg highlight |
| Facility | Multi-select chips | Searchable two-column (Name + ID), filtered by Market |
| Department | Multi-select chips | Searchable two-column (Name + ID), filtered by Facility |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AccessScopeManager.tsx` | Add cascading logic, replace Facility/Department with searchable two-column popovers |
| `src/components/ui/multi-select-chips.tsx` | Remove `Check` icon from list items, keep only bg highlight for selection |

---

## Expected Outcome

- Editing a user's Access Scope now shows cascading filters where Market options are filtered by selected Regions, Facilities by Markets, and Departments by Facilities
- Facility and Department use a searchable dropdown with two-column layout (Name + ID with divider)
- Selection is indicated by background color only (no checkmarks)
- Same visual styling as the global FilterBar

