

# Fix Square Borders on Sidebar Icons

## Problem
The sidebar icons have `stroke-[1.5]` applied in their CSS class. This is a Lucide-specific style (Lucide icons use strokes to draw). Material Design icons use **fills** instead, so adding a stroke draws visible rectangular outlines around the icon shapes -- the "square borders" you see.

## Solution
Remove `stroke-[1.5]` from the icon class in `DynamicIconOnlySidebar.tsx`.

## What Changes

**File: `src/components/layout/DynamicIconOnlySidebar.tsx`**, line 90

- **From:** `className="relative z-10 h-5 w-5 stroke-[1.5]"`
- **To:** `className="relative z-10 h-5 w-5"`

Single class removal. No other files need changes.

Also revert the icon mappings in `src/lib/icons.ts` back to the filled variants (`MdGroup`, `MdManageAccounts`, etc.) since the outlined variants were only tried as a workaround. The real fix is removing the stroke class. However, if you prefer the outlined style, we can keep them -- just removing `stroke-[1.5]` will fix the squares either way.

