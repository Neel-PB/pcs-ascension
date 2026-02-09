

# Match Regions Column Border to Skill Group Borders

## Problem
The "Regions" column's right border uses `border-r border-border` (1px, subtle gray), while all skill group columns use `border-l-2 border-muted-foreground/30` (2px, darker). This mismatch makes the Regions column look visually different.

## Solution

### File: `src/pages/staffing/VarianceAnalysis.tsx`

Change all sticky first-column borders from `border-r border-border` to `border-r-2 border-muted-foreground/30` so the Regions separator matches the skill group separators exactly.

| Location | Current | After |
|----------|---------|-------|
| Header Row 1 (line 640) | `border-r border-border` | `border-r-2 border-muted-foreground/30` |
| Header Row 2 (line 648) | `border-r border-border` | `border-r-2 border-muted-foreground/30` |
| GroupRow sticky cell (line 435) | `border-r border-border` | `border-r-2 border-muted-foreground/30` |
| SkillRow sticky cell (line 501) | `border-r border-border` | `border-r-2 border-muted-foreground/30` |
| TotalRow sticky cell (line 585) | `border-r border-border` | `border-r-2 border-muted-foreground/30` |

This makes the Regions column separator identical in thickness and color to every skill group divider (CL Skill, RN Skill, PCT Skill, HUC, Overhead).

