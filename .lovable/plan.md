

# Fix Staffing Icon — Remove Boxy/Square Body Shapes

## Problem
The `MdPeopleOutline` icon has rectangular torso shapes built into its SVG design. These appear as unwanted "square borders" at small sizes in the sidebar.

## Solution
Switch the `Users` alias from `MdPeopleOutline` to `MdGroup` in `src/lib/icons.ts`. The `MdGroup` icon renders two people with rounder, more natural body shapes -- no rectangular/boxy elements.

## What Changes

**File:** `src/lib/icons.ts`, line 121

| Before | After |
|---|---|
| `MdPeopleOutline as Users` | `MdGroup as Users` |

Single-line change. All components importing `Users` from `@/lib/icons` will automatically use the new icon.

## Impact
- Staffing sidebar icon
- Any other component referencing `Users` (e.g., `AIWelcomeCards`, `RecipientMultiSelect`)

