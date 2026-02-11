

# Style CommandInput to Match Helix SearchField

## Summary

Update the `CommandInput` component in `src/components/ui/command.tsx` to use the same pill-shaped (rounded-full) styling as the new `SearchField` component. This will make the search inputs inside the Facility and Department filter dropdowns visually consistent with the rest of the app's search fields.

## File to Edit

**`src/components/ui/command.tsx`** (lines 41-53)

Update the `CommandInput` wrapper and input element:

### Current
```tsx
<div className="flex items-center border-b px-3" cmdk-input-wrapper="">
  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
  <CommandPrimitive.Input
    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none ..."
  />
</div>
```

### Updated
- Wrap in a `relative` container with horizontal padding (`px-3 py-2`) and bottom border
- Position the Search icon absolutely on the left (matching `SearchField`'s `left-4` positioning)
- Make the input pill-shaped (`rounded-full`) with a subtle border
- Add left padding (`pl-10`) for icon space and right padding (`pr-4`)
- Apply the same focus style: `focus-visible:border-b-2 focus-visible:border-primary`

This is a single-component change -- every `CommandInput` usage (Facility dropdown, Department dropdown, and any future Command-based search) will automatically pick up the new style.

