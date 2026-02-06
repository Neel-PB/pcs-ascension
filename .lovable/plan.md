

# Fix Two-Column Grid Layout in Dropdown Items

## Problem

The CSS Grid layout inside `SelectItemNoCheck` isn't working because `SelectPrimitive.ItemText` wraps the children as an inline element, preventing the grid from expanding to full width.

In the screenshot, you can see:
- Names and IDs are on the same line but IDs are NOT right-aligned
- The grid columns aren't being respected

---

## Root Cause

```text
SelectPrimitive.Item (flex container)
  └── SelectPrimitive.ItemText (inline wrapper - breaks layout!)
        └── <div className="grid ..."> (can't expand)
```

The `ItemText` wrapper doesn't have `w-full` styling, so the grid child can't expand.

---

## Solution

Add `className="w-full"` to the `SelectPrimitive.ItemText` component inside `SelectItemNoCheck`:

### File: `src/components/ui/select.tsx`

**Update SelectItemNoCheck (lines 125-140):**

```typescript
const SelectItemNoCheck = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="w-full">{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
```

The key change is adding `className="w-full"` to `SelectPrimitive.ItemText`.

---

## Expected Result

```text
BEFORE (broken grid):
┌──────────────────────────────────────────────────┐
│ ASH Pensacola Hospital                    26012  │  ← IDs not aligned
│ ASH Pensacola Hospital Gulf Breeze  26017        │
│ Sacred Heart Bay MC              26013           │
└──────────────────────────────────────────────────┘

AFTER (working grid):
┌───────────────────────────────────┬──────────────┐
│ ASH Pensacola Hospital            │        26012 │
│ ASH Pensacola Hospital Gulf Breeze│        26017 │
│ Sacred Heart Bay MC               │        26013 │
└───────────────────────────────────┴──────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/select.tsx` | Add `className="w-full"` to ItemText in SelectItemNoCheck |

