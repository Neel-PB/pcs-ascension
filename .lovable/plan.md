

## Fix Oversized Pencil and Revert Icons in Volume Settings and NP Settings

### Root Cause

The `Button` component has CSS rules that **force SVG sizes** regardless of individual icon classes:

- Base button style: `[&_svg]:size-4` (forces 16px for all SVGs)
- `size="icon"` variant: `[&_svg]:size-6` (forces 24px for all SVGs)

In **Volume Settings** and **NP Settings**, the pencil and revert icons are wrapped in `<Button variant="ghost" size="icon" className="h-6 w-6">`. Even though the icon has `className="h-3.5 w-3.5"` (14px), the Button's `[&_svg]:size-6` wins due to higher CSS specificity, inflating the icon to 24px.

In **Positions** (Employees tab), `EditableFTECell` renders the pencil icon as a plain SVG element -- no Button wrapper -- so the `h-3.5 w-3.5` class applies correctly.

### Fix

Update the affected cell components to remove the Button wrapper around the pencil/revert icons and render them as plain icon elements (matching the pattern used in `EditableFTECell`).

**Files to update:**

1. **`src/components/editable-table/cells/OverrideVolumeCell.tsx`**
   - In the `idle` state: replace the `<Button>` wrapping the pencil with a plain clickable `<span>` or icon element
   - In the `saved` state: replace the `<Button>` wrapping the revert icon with a plain clickable icon element
   - Match the pattern: `<Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={...} />`

2. **`src/components/editable-table/cells/EditableDateCell.tsx`**
   - Replace the `<Button>` wrapping the pencil and revert icons with plain icon elements
   - Same approach as above

3. **`src/components/editable-table/cells/EditableNumberCell.tsx`**
   - Same fix: replace Button wrappers around pencil/revert with plain icons

4. **`src/components/editable-table/cells/EditableNumberPopoverCell.tsx`**
   - Same fix: replace Button wrappers around pencil/revert with plain icons

### Technical Details

The fix pattern for each cell is to change:
```tsx
<Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
  <Pencil className="h-3.5 w-3.5" />
</Button>
```

To:
```tsx
<Pencil
  className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
  onClick={handleStartEdit}
/>
```

And similarly for `RotateCcw` revert icons. This matches exactly how `EditableFTECell` renders its icons in the Positions table.

### No changes needed
- `EditableFTECell.tsx` -- already uses plain icons (no Button wrapper)
- `ShiftCell.tsx` -- already uses plain icons (no Button wrapper)
- `src/lib/icons.ts` -- icon mappings are correct
- `src/components/ui/button.tsx` -- the `[&_svg]:size-6` rule is correct for actual icon buttons; the fix is to stop misusing Button for tiny inline action icons
