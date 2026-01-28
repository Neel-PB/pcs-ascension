
# Fix Skills Column Width Consistency Between Nursing/Non-Nursing Views

## Problem

In the "FTE Skill Shift Analysis" table on the Planned/Active Resources tab, the Skills column changes width when switching between Nursing and Non-Nursing views. This happens because:

- **Nursing view**: 13 columns (Skills + Target FTEs×3 + Hired FTEs×3 + Open Req FTEs×3 + Variance×3)
- **Non-Nursing view**: 7 columns (Skills + Hired FTEs×3 + Open Req FTEs×3)

When 6 columns are hidden, the table redistributes space, causing the Skills column to expand or shift.

## Root Cause

The Skills column header (line 540) uses `w-32` but lacks a `min-w-32` constraint, and the table cells for skills don't have matching fixed widths:

```tsx
// Header
<TableHead className="font-semibold text-foreground w-32">Skills</TableHead>

// Cells (no width set)
<TableCell className="font-semibold whitespace-nowrap">...</TableCell>
```

## Solution

Apply consistent fixed width (`w-48` = 192px) with matching `min-w-48` to the Skills column header and all corresponding cells across all row types:

| Element | Current | New |
|---------|---------|-----|
| TableHead (Skills) | `w-32` | `w-48 min-w-48` |
| GroupRow TableCell | `whitespace-nowrap` | `w-48 min-w-48 whitespace-nowrap` |
| SkillRow TableCell | (none) | `w-48 min-w-48` |
| TotalRow TableCell | `whitespace-nowrap` | `w-48 min-w-48 whitespace-nowrap` |

This ensures the Skills column maintains exactly 192px regardless of how many other columns are visible.

## Files to Modify

**`src/pages/staffing/PositionPlanning.tsx`**

### Change 1: Skills Header (line 540)
```tsx
// Before
<TableHead className="font-semibold text-foreground w-32">Skills</TableHead>

// After
<TableHead className="font-semibold text-foreground w-48 min-w-48">Skills</TableHead>
```

### Change 2: Second Header Row Empty Cell (line 561)
```tsx
// Before
<TableHead></TableHead>

// After
<TableHead className="w-48 min-w-48"></TableHead>
```

### Change 3: GroupRow TableCell (line 367)
```tsx
// Before
<TableCell className="font-semibold whitespace-nowrap">

// After
<TableCell className="font-semibold whitespace-nowrap w-48 min-w-48">
```

### Change 4: SkillRow TableCell (lines 429-432)
```tsx
// Before
<TableCell className={cn(
  "font-medium whitespace-nowrap",
  isChildRow && "pl-8"
)}>

// After
<TableCell className={cn(
  "font-medium whitespace-nowrap w-48 min-w-48",
  isChildRow && "pl-8"
)}>
```

### Change 5: TotalRow TableCell (line 478)
```tsx
// Before
<TableCell className="font-semibold whitespace-nowrap">{data.skill}</TableCell>

// After
<TableCell className="font-semibold whitespace-nowrap w-48 min-w-48">{data.skill}</TableCell>
```

## Expected Result

| View | Skills Column Width |
|------|---------------------|
| Nursing | 192px (fixed) |
| Non-Nursing | 192px (fixed) |

The Skills column will remain exactly the same width when toggling between Nursing and Non-Nursing, providing a stable visual experience.

## Technical Notes

- `w-48` = 192px provides enough space for skill names like "Patient Care Technician"
- `min-w-48` prevents the column from shrinking when fewer columns are present
- The fixed width approach ensures consistency without relying on table auto-layout
