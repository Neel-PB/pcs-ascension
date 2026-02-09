

# Fix Row Colors in Planned/Active Resources Table

## Problem
- **Group rows** (Overheads, Clinical Staff, Support Staff) should have a **light blue background** to visually distinguish them as category headers
- **Child skill rows** (Director, RN, PCT, etc.) should have the **default background** (no color), not the alternating even/odd striping
- Currently, the global `TableBody` component applies `nth-child(even):bg-muted/30` to ALL tables, which incorrectly colors even skill rows

## Solution

### 1. `src/pages/staffing/PositionPlanning.tsx`

**GroupRow (line 364):** Change `bg-primary/5 hover:bg-primary/10` to a more visible light blue: `bg-primary/10 hover:bg-primary/15`
- Also update the sticky cell background on line 367 to match

**SkillRow (line 424):** Add explicit `bg-background` to override the even/odd striping inherited from TableBody
- This ensures all child rows stay on the default background regardless of their position

### 2. No changes to `src/components/ui/table.tsx`
The global even/odd striping stays for other tables (Employees, Requisitions, etc.). We override it only in the PositionPlanning rows.

## Summary

| Row Type | Current | After |
|----------|---------|-------|
| Group (Overheads, Clinical, Support) | `bg-primary/5` (very faint blue) | `bg-primary/10` (clear light blue) |
| Child Skill (Director, RN, etc.) | Even/odd striping (`bg-muted/30`) | `bg-background` (default, no stripe) |
| Total Row | `bg-muted/50` | No change |

## File to Modify

| File | Change |
|------|--------|
| `src/pages/staffing/PositionPlanning.tsx` | Update GroupRow and SkillRow background classes |

