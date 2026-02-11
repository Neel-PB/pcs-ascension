

# Positions Module: Badge Color Semantics and Layout Refinement

## Problem

Currently, **Active FTE** values use `text-destructive` (red) when the value has been modified from the original hired FTE. Red universally signals "error" or "danger" in UI design, but a modified Active FTE is an intentional adjustment (e.g., LOA, shared position) -- not an error. This creates a false alarm effect across the table.

Meanwhile, **Vacancy Age** badges correctly use red for urgent (>60 days) scenarios, which is appropriate.

## Changes

### 1. Active FTE: Replace red with a neutral "modified" indicator

**File: `src/components/editable-table/cells/EditableFTECell.tsx`** (line 259)

- Change `isModified && "text-destructive"` to `isModified && "text-primary"` (blue)
- Blue communicates "this value has been changed" without implying something is broken
- The revert icon already provides the affordance to undo the change

### 2. Vacancy Age badges: Keep current color logic (no change)

**File: `src/config/requisitionColumns.tsx`**

- `destructive` (red) for >60 days "Urgent" -- correct, stays
- `secondary` (gray) for >30 days "Attention" -- change to a warning color using a custom amber/yellow badge class
- `default` (primary/blue) for "On Track" -- change to a subtle green/success style

### 3. Vacancy Age badge styling refinement

**File: `src/config/requisitionColumns.tsx`** (lines 17-24)

Update `getVacancyBadge` to return className-based styling instead of relying solely on variant:

| Days | Current | Proposed |
|------|---------|----------|
| >60 | `destructive` (red) | Keep `destructive` (red) -- urgency is correct |
| >30 | `secondary` (gray) | `outline` + amber/yellow background class |
| <=30 | `default` (blue) | `outline` + green/emerald background class |
| null | `secondary` + dash | Keep as-is |

### 4. Active FTE badge-style indicator for status

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

When Active FTE is modified, show a small status badge (e.g., "LOA", "FMLA") next to the value in the table cell using a subtle outline badge, replacing the plain red number. This gives context to why the FTE was changed.

## Technical Details

**EditableFTECell.tsx trigger button (line ~252-275):**
```tsx
// Before
isModified && "text-destructive"

// After  
isModified && "text-primary"
```

**requisitionColumns.tsx getVacancyBadge (lines 17-24):**
```tsx
const getVacancyBadge = (days: number | null) => {
  if (!days) return { variant: 'secondary' as const, label: '---', className: '' };
  if (days > 60)
    return { variant: 'destructive' as const, label: `${days}d - Urgent`, className: '' };
  if (days > 30)
    return { variant: 'outline' as const, label: `${days}d - Attention`, className: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400' };
  return { variant: 'outline' as const, label: `${days}d - On Track`, className: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' };
};
```

**BadgeCell update** to accept and pass through `className` to the inner Badge (already supported).

## What Stays the Same

- All popover form logic, save/revert behavior
- Table structure and column order
- Comment counts and other cell types
- Shared position layout (just updated in previous changes)

