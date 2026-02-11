
# Style "More Filters" Button to Match Toggle Button Group

## What Changes

Update the `CombinedOptionalFilters` trigger button to use the same Helix outlined toggle button styling -- rounded-full pill shape with a 2px primary border -- instead of the current dashed outline style.

## File to Edit

**`src/components/staffing/CombinedOptionalFilters.tsx`** (lines 49-61)

Update the trigger `Button` className from:
```
bg-muted/30 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground
```

To the toggle button group style:
```
rounded-full border-2 border-primary bg-background text-foreground hover:bg-primary/10
```

The active count badge already uses `bg-primary text-primary-foreground rounded-full` which fits well with this style.

### Also update the optional filter Select triggers on wide screens

**`src/components/staffing/FilterBar.tsx`** -- the three expanded optional filter `SelectTrigger` elements (Submarket ~line 568, Level 2 ~line 586, PSTAT ~line 604) currently use the same dashed muted style. Update them to match:
```
rounded-full border-2 border-primary bg-background text-foreground hover:bg-primary/10
```

This ensures both compact (More Filters dropdown) and expanded (individual Select dropdowns) views share the same visual language as the toggle button group.

## Technical Details

- **CombinedOptionalFilters.tsx line 51**: Replace button className with pill/primary-border style
- **FilterBar.tsx line 568**: Update Submarket SelectTrigger className
- **FilterBar.tsx line 586**: Update Level 2 SelectTrigger className  
- **FilterBar.tsx line 604**: Update PSTAT SelectTrigger className
- No structural or behavioral changes -- only CSS class updates
