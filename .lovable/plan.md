

# Selected Item Highlight + Fixed Filter Width

## Two Requirements

1. **Blue highlight on selected items** - When an item is selected in the dropdown, show it with a light blue/primary background
2. **Fixed filter trigger width** - The filter button width must NEVER change when a value is selected

---

## Technical Changes

### 1. Fix Filter Trigger Widths (FilterBar.tsx)

The issue is using `min-w-[Xpx]` which allows the trigger to GROW. Change to fixed `w-[Xpx]` and add `overflow-hidden` with text truncation.

| Filter | Current | Fixed |
|--------|---------|-------|
| Region | `min-w-[120px]` / `w-[150px]` | `w-[120px]` / `w-[150px]` |
| Market | `min-w-[120px]` / `w-[150px]` | `w-[120px]` / `w-[150px]` |
| Facility | `min-w-[160px]` / `w-[250px]` | `w-[160px]` / `w-[250px]` |
| Department | `min-w-[140px]` / `w-[180px]` | `w-[140px]` / `w-[180px]` |

Also ensure the SelectValue text truncates with `[&>span]:truncate`.

### 2. Blue Background on Selected Items (select.tsx)

Add `data-[state=checked]` styling to show primary/blue background when selected:

```typescript
// SelectItem - add selected state styling
"data-[state=checked]:bg-primary/15 data-[state=checked]:border data-[state=checked]:border-primary/30"

// SelectItemNoCheck - same styling
"data-[state=checked]:bg-primary/15 data-[state=checked]:border data-[state=checked]:border-primary/30"
```

This uses the app's primary color at 15% opacity for a subtle blue highlight.

---

## Visual Result

**Dropdown with selected item:**
```text
┌────────────────────────────┬──────────┐
│ ASH Pensacola Hospital     │    26012 │  ← Normal
├────────────────────────────┼──────────┤
│ Sacred Heart Bay MC  ░░░░░░│░░░26013░░│  ← Selected (blue bg)
├────────────────────────────┼──────────┤
│ Gulf Breeze Campus         │    26017 │  ← Normal
└────────────────────────────┴──────────┘
```

**Filter trigger (fixed width):**
```text
BEFORE (width grows with content):
┌─────────────────────────────────────────────────┐
│ Sacred Heart Bay Medical Center         ▼      │  ← Too wide!
└─────────────────────────────────────────────────┘

AFTER (fixed width, text truncates):
┌──────────────────────┐
│ Sacred Heart Bay...▼ │  ← Fixed width, truncated text
└──────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/select.tsx` | Add `data-[state=checked]:bg-primary/15` styling to SelectItem and SelectItemNoCheck |
| `src/components/staffing/FilterBar.tsx` | Change `min-w-[Xpx]` to `w-[Xpx]` for all filter triggers on compact screens |

