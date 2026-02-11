

# Fix Square/Boxy Sidebar Icons — Switch to Outlined Variants

## Problem
The sidebar navigation icons use **filled** Material Design icons (`Md*`) that have solid rectangular/square background shapes built into their SVGs. At small sizes (20x20px), these appear as unwanted "square borders or lines" around the icons.

## Solution
Switch all sidebar-relevant icon mappings in `src/lib/icons.ts` from filled (`Md*`) to outlined (`MdOutline*`) variants. This removes the solid background shapes while keeping the same recognizable icon designs.

## Changes

**File: `src/lib/icons.ts`** — Update these 7 mappings:

| Alias | Current (Filled) | New (Outlined) |
|---|---|---|
| `Users` | `MdGroup` | `MdOutlinePeopleOutline` or `MdOutlineGroup` |
| `UserCog` | `MdManageAccounts` | `MdOutlineManageAccounts` |
| `TrendingUp` | `MdTrendingUp` | `MdOutlineTrendingUp` |
| `FileBarChart` | `MdInsertChart` | `MdOutlineInsertChart` |
| `LifeBuoy` | `MdHelp` | `MdOutlineHelp` |
| `ShieldCheck` | `MdVerifiedUser` | `MdOutlineVerifiedUser` |
| `MessageSquare` | `MdChat` | `MdOutlineChat` |

No other files need changes — all components import these icons via the centralized `@/lib/icons` adapter, so the update propagates automatically.

## Impact
- All 7 sidebar navigation icons will switch to clean outlined style
- Any other component referencing these same aliases will also get the outlined variant
- Consistent visual style across the entire sidebar

