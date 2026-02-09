

# Fix Group Row Colors Being Overridden by Even/Odd Striping

## Problem
The global `TableBody` applies `[&_tr:nth-child(even)]:bg-muted/30` which overrides the `bg-primary/10` on group rows that happen to land on even positions. This is why "Overheads" and "Support Staff" look the same -- one gets the blue, the other gets the stripe color depending on its position.

## Solution

### File: `src/pages/staffing/PositionPlanning.tsx`

**GroupRow (line 364):** Use Tailwind's `!` modifier to force the blue background:
- Change `bg-primary/10 hover:bg-primary/15` to `!bg-primary/10 hover:!bg-primary/15`
- This ensures the light blue always takes priority over the even/odd striping rule

**SkillRow (line 424):** Same treatment for the default background:
- Change `bg-background` to `!bg-background`
- This ensures child rows never get the stripe color

No other files need to change. The global TableBody striping remains intact for all other tables.

## Result

| Row Type | Fix |
|----------|-----|
| Group (Overheads, Clinical, Support) | Always light blue, regardless of even/odd position |
| Child Skill (Director, RN, etc.) | Always default background, no striping |

