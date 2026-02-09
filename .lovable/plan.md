

# Fix Variance Analysis - Regions Column Border Consistency

## Problem
The "Regions" column looks visually different from the skill columns because:
1. The skill group headers (CL Skill, RN Skill, etc.) all have `border-l-2 border-muted-foreground/30` creating vertical dividers between groups
2. The "Regions" column has no right border, so there's no clear visual separation between the first column and the data columns
3. The first data cell in each row (CL Day) has a `border-l-2` on its left side, but the sticky "Regions" cell doesn't have a matching right border, causing an inconsistent look when scrolling

## Solution

### File: `src/pages/staffing/VarianceAnalysis.tsx`

Add a right border to the sticky "Regions" column across all row types to create a consistent visual separator:

| Row Type | Line | Current | After |
|----------|------|---------|-------|
| Header Row 1 (columnHeader) | 640 | `sticky left-0 bg-card z-10 min-w-[200px]` | Add `border-r border-border` |
| Header Row 2 (empty cell) | 648 | `sticky left-0 bg-muted/50 z-10` | Add `border-r border-border` |
| GroupRow sticky cell | 435 | `font-semibold sticky left-0 !bg-primary/10 whitespace-nowrap` | Add `border-r border-border` |
| SkillRow sticky cell | 501 | `font-medium sticky left-0 !bg-background pl-8` | Add `border-r border-border` |
| TotalRow sticky cell | 585 | `font-bold sticky left-0 !bg-muted/20` | Add `border-r border-border` |

This adds a subtle right border on the sticky first column, creating a clean visual divider that matches the vertical separators between the skill groups.

