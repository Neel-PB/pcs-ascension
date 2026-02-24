

## Make KPI Section Drag Handle Always Visible with Primary Highlight

### Problem

The GripVertical drag handle icon on KPI sections in the Summary modal is hidden by default and only appears on hover (`opacity-0 group-hover:opacity-100`). The user wants it always visible, with a primary color highlight on hover/active.

### Change

| File | Change |
|------|--------|
| `src/components/staffing/DraggableKPISection.tsx` | Update drag handle classes on line 64 to be always visible with primary hover/active styling |

### Details

Replace the current drag handle classes:

```text
Before: opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground

After:  cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-primary active:text-primary transition-colors duration-200
```

- Remove `opacity-0 group-hover:opacity-100` so the icon is always visible
- Add `hover:text-primary active:text-primary` for brand blue highlight on interaction
- Switch from `transition-opacity` to `transition-colors` since the animation is now on color, not visibility
