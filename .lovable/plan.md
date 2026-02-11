

# Switch All Sidebar Icons to Outlined Variants

## Problem
The sidebar menu icons currently use filled Material Design variants which look heavy. You want the cleaner outlined style like `MdPeopleOutline`.

## Solution
Update the 7 icon aliases in `src/lib/icons.ts` that the sidebar uses, switching each from the filled `Md*` to the outlined `MdOutline*` variant.

## What Changes

**File: `src/lib/icons.ts`** -- 7 mapping updates:

| Alias | Current (Filled) | New (Outlined) |
|---|---|---|
| Users | MdGroup | MdOutlinePeopleOutline |
| UserCog | MdManageAccounts | MdOutlineManageAccounts |
| TrendingUp | MdTrendingUp | MdOutlineTrendingUp |
| FileBarChart | MdInsertChart | MdOutlineInsertChart |
| LifeBuoy | MdHelp | MdOutlineHelpOutline |
| ShieldCheck | MdVerifiedUser | MdOutlineVerifiedUser |
| MessageSquare | MdChat | MdOutlineChatBubbleOutline |

Note: `MdOutlinePeopleOutline` matches the icon you referenced. `MdOutlineHelpOutline` and `MdOutlineChatBubbleOutline` are the true outline equivalents (cleaner than `MdOutlineHelp` / `MdOutlineChat`).

No other files change -- all components import via `@/lib/icons`.

