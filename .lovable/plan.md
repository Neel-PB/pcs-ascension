

# Clean Two-Column Layout for Facility and Department Dropdowns

## Summary

Create a simple two-column layout without any check icon:
- **Name** aligned to the left edge
- **ID** aligned to the right edge

---

## Visual Goal

```text
CURRENT (with check icon):
┌──────────────────────────────────────────────────┐
│ ✓  Ascension St. Vincent Carmel          F001   │
│    Amita Health Alexian Brothers         F002   │
└──────────────────────────────────────────────────┘
 ↑ Check icon + padding

PROPOSED (clean two-column):
┌──────────────────────────────────────────────────┐
│ Ascension St. Vincent Carmel              F001  │
│ Amita Health Alexian Brothers             F002  │
└──────────────────────────────────────────────────┘
 ↑ Name left                           ID right ↑
```

---

## Technical Changes

### File: `src/components/ui/select.tsx`

**Add a new `SelectItemNoCheck` component (after line 123):**

This variant removes the check icon entirely and uses normal padding:

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
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItemNoCheck.displayName = "SelectItemNoCheck";
```

**Update exports (line 133-144):**

```typescript
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectItemNoCheck,  // Add this
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
```

---

### File: `src/components/staffing/FilterBar.tsx`

**1. Update imports (around line 2):**

```typescript
import { Select, SelectContent, SelectItem, SelectItemNoCheck, SelectTrigger, SelectValue } from "@/components/ui/select";
```

**2. Update Facility dropdown items (lines 361-369):**

```typescript
{availableFacilities.map(facility => (
  <SelectItemNoCheck key={facility.facility_id || facility.id} value={facility.facility_id}>
    <div className="flex items-center justify-between w-full gap-4">
      <span className="truncate">{facility.facility_name}</span>
      <span className="text-xs text-muted-foreground font-mono shrink-0">
        {facility.facility_id}
      </span>
    </div>
  </SelectItemNoCheck>
))}
```

**3. Update Department dropdown items (same pattern):**

```typescript
{availableDepartments.map(dept => (
  <SelectItemNoCheck key={dept.department_id} value={dept.department_id}>
    <div className="flex items-center justify-between w-full gap-4">
      <span className="truncate">{dept.department_name}</span>
      <span className="text-xs text-muted-foreground font-mono shrink-0">
        {dept.department_id}
      </span>
    </div>
  </SelectItemNoCheck>
))}
```

---

## Key Differences

| Aspect | SelectItem (default) | SelectItemNoCheck (new) |
|--------|---------------------|------------------------|
| Left padding | `pl-8` (space for check) | `px-2` (normal) |
| Check icon | Absolute positioned left | None |
| Content width | Reduced by check space | Full width |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/select.tsx` | Add `SelectItemNoCheck` variant without check icon |
| `src/components/staffing/FilterBar.tsx` | Use `SelectItemNoCheck` for Facility and Department items |

