
# Fix View Mode Toggle Highlighting

## Root Cause

The `cn()` utility uses `tailwind-merge` which can cause class conflicts. When we pass both:
- Variant classes: `data-[state=on]:bg-primary` (from `toggleVariants`)
- Explicit classes: `bg-primary text-primary-foreground` (from our conditional)

They can conflict because `tailwind-merge` deduplicates `bg-*` classes.

Additionally, wrapping `ToggleGroupItem` in `TooltipTrigger asChild` may interfere with the `data-state` attribute propagation.

## Solution

Use a **pure CSS approach without relying on `data-state`** by creating styled wrapper components that handle their own highlighting based on the `viewMode` prop.

### Implementation

**File: `src/pages/admin/AccessControlPage.tsx`**

Replace the current ToggleGroup implementation with simple buttons styled directly:

1. Remove the ToggleGroup component entirely
2. Use a simple `div` container with the same styling
3. Create individual button elements that:
   - Call `setViewMode()` on click
   - Have explicit classes based on `viewMode === "value"` check
   - Include the icons directly

This bypasses all Radix state management and CSS specificity issues.

```tsx
// Replace ToggleGroup with:
<div className="flex items-center bg-muted/50 p-0.5 rounded-md border border-border">
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={() => setViewMode("matrix")}
        className={cn(
          "inline-flex items-center justify-center h-8 px-2.5 rounded-md text-sm font-medium transition-colors",
          viewMode === "matrix"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        )}
        aria-label="Matrix view"
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom">Matrix View</TooltipContent>
  </Tooltip>
  
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={() => setViewMode("detail")}
        className={cn(
          "inline-flex items-center justify-center h-8 px-2.5 rounded-md text-sm font-medium transition-colors",
          viewMode === "detail"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        )}
        aria-label="Detail view"
      >
        <LayoutPanelLeft className="h-4 w-4" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom">Role Detail View</TooltipContent>
  </Tooltip>
  
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={() => setViewMode("list")}
        className={cn(
          "inline-flex items-center justify-center h-8 px-2.5 rounded-md text-sm font-medium transition-colors",
          viewMode === "list"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        )}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom">Permission List</TooltipContent>
  </Tooltip>
</div>
```

### Why This Works

1. **No Radix state management** - No `data-state` attribute needed
2. **No class merging conflicts** - Classes are applied directly, not merged with variant classes
3. **Direct state binding** - `viewMode === "matrix"` is evaluated at render time
4. **Simple and debuggable** - Easy to inspect and verify

### Cleanup

Remove these imports that are no longer needed:
- `ToggleGroup` and `ToggleGroupItem` from toggle-group

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/AccessControlPage.tsx` | Replace ToggleGroup with native buttons; remove ToggleGroup imports |

## Visual Result

The selected view mode will have:
- Solid primary (blue) background
- White icon
- Subtle shadow

Unselected modes will have:
- Transparent background
- Muted gray icon
- Hover effect for interactivity
