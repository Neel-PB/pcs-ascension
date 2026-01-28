
# Fix Skills Column Width to Be Truly Fixed (Both Views)

## Problem

In the Non-Nursing view, the Skills column is **expanding** to fill the extra horizontal space when the Target FTEs and Variance columns are hidden. While we added `min-w-48` to prevent shrinking, the column is still growing.

The table uses `w-full` CSS which causes it to fill available space, and remaining columns stretch proportionally.

## Solution

Add `max-w-48` to all Skills column elements to create a truly fixed-width column that cannot shrink OR grow:

| Width Class | Purpose |
|-------------|---------|
| `w-48` | Sets default width to 192px |
| `min-w-48` | Prevents shrinking below 192px |
| `max-w-48` | Prevents growing above 192px |

## Files to Modify

**`src/pages/staffing/PositionPlanning.tsx`**

### Change 1: Skills Header (line 540)
```tsx
// Before
<TableHead className="font-semibold text-foreground w-48 min-w-48">Skills</TableHead>

// After
<TableHead className="font-semibold text-foreground w-48 min-w-48 max-w-48">Skills</TableHead>
```

### Change 2: Second Header Row Empty Cell (line 561)
```tsx
// Before
<TableHead className="w-48 min-w-48"></TableHead>

// After
<TableHead className="w-48 min-w-48 max-w-48"></TableHead>
```

### Change 3: GroupRow TableCell (line 367)
```tsx
// Before
<TableCell className="font-semibold whitespace-nowrap w-48 min-w-48">

// After
<TableCell className="font-semibold whitespace-nowrap w-48 min-w-48 max-w-48">
```

### Change 4: SkillRow TableCell (line 429)
```tsx
// Before
<TableCell className={cn(
  "font-medium whitespace-nowrap w-48 min-w-48",
  isChildRow && "pl-8"
)}>

// After
<TableCell className={cn(
  "font-medium whitespace-nowrap w-48 min-w-48 max-w-48",
  isChildRow && "pl-8"
)}>
```

### Change 5: TotalRow TableCell (line 478)
```tsx
// Before
<TableCell className="font-semibold whitespace-nowrap w-48 min-w-48">{data.skill}</TableCell>

// After
<TableCell className="font-semibold whitespace-nowrap w-48 min-w-48 max-w-48">{data.skill}</TableCell>
```

## Expected Result

| View | Skills Column Width |
|------|---------------------|
| Nursing | 192px (fixed) |
| Non-Nursing | 192px (fixed) |

The Skills column will now maintain exactly 192px in BOTH directions - it cannot shrink OR grow, ensuring identical appearance in both Nursing and Non-Nursing views.
