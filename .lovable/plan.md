

# Fix View Mode Toggle Highlighting

## Problem

The toggle buttons show no visible highlight because the base toggle styles (`data-[state=on]:bg-accent`) compete with our custom styles (`data-[state=on]:bg-primary`). Both have equal CSS specificity, and the base styles are winning.

---

## Solution

Override the base toggle variant styles directly in the toggle component by adding a new `primary` variant that uses primary colors for the selected state.

---

## Implementation

### File: `src/components/ui/toggle.tsx`

Add a new `primary` variant that overrides the `data-[state=on]` styles:

```tsx
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        primary: "bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

### File: `src/pages/admin/AccessControlPage.tsx`

Update the ToggleGroup to use the new `primary` variant:

```tsx
<ToggleGroup
  type="single"
  value={viewMode}
  onValueChange={(value) => value && setViewMode(value as ViewMode)}
  className="bg-muted/50 p-0.5 rounded-md"
  variant="primary"  // Add this prop
>
```

Remove the custom `data-[state=on]` classes from individual items since the variant handles it:

```tsx
<ToggleGroupItem value="matrix" aria-label="Matrix view" className="h-8 px-2.5">
<ToggleGroupItem value="detail" aria-label="Detail view" className="h-8 px-2.5">
<ToggleGroupItem value="list" aria-label="List view" className="h-8 px-2.5">
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/toggle.tsx` | Move `data-[state=on]` styles from base into variants; add new `primary` variant |
| `src/components/ui/toggle-group.tsx` | Ensure variant prop passes through to items |
| `src/pages/admin/AccessControlPage.tsx` | Add `variant="primary"` to ToggleGroup; remove custom data-state classes from items |

---

## Visual Result

```text
Before (no highlight visible):
┌────┬────┬────┐
│ □  │ ⊞  │ ≡  │  ← all appear same gray
└────┴────┴────┘

After (selected view highlighted):
┌────┬────┬─────┐
│ □  │ ⊞  │[≡] │  ← selected has primary blue background
└────┴────┴─────┘
```

