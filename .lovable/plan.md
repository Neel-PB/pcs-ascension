

# Fix Variance Analysis: Blank Departments + Missing Row Dividers

## Issue 1: Departments Show "..."

The `SkillRow` component's first `TableCell` (line 501-503) literally contains `...` instead of the actual row name. This happened during a previous edit where the name + tooltip rendering was accidentally replaced with literal ellipsis text.

### Fix

Restore the proper name rendering in the SkillRow's first TableCell. The content should show:
- `row.name` as the visible text (truncated with CSS)
- `row.subText` as a primary-colored badge (for IDs like department ID or facility ID)
- A tooltip showing the full name on hover

```tsx
<TableCell className="font-medium sticky left-0 !bg-background pl-8 border-r-2 border-muted-foreground/30">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 max-w-[180px]">
          <span className="truncate text-sm">{row.name}</span>
          {row.subText && (
            <Badge variant="outline" className="bg-primary/10 text-primary text-xs shrink-0">
              {row.subText}
            </Badge>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{row.name}{row.subText ? ` (${row.subText})` : ''}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</TableCell>
```

## Issue 2: No Row Divider Between Region Rows

When viewing Regions (all filters at default), Region 1 and Region 2 are both `GroupRow` components. The current `border-t-2 border-primary/20` on GroupRow is too subtle (20% opacity primary color). 

### Fix

Change the GroupRow's top border to a more visible divider:
- Use `border-t border-border` instead of `border-t-2 border-primary/20` -- this gives a standard 1px solid border that matches the rest of the table's divider style and is clearly visible.

### File Changed

`src/pages/staffing/VarianceAnalysis.tsx`

1. **Line 502**: Replace literal `...` with proper name + badge + tooltip rendering
2. **Line 432**: Change `border-t-2 border-primary/20` to `border-t border-border` on GroupRow

