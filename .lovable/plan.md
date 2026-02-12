

## Fix Surplus Tab Content Pushed to Bottom

### Problem
When the Surplus (or Shortage) tab is active, the hidden "KPIs" `TabsContent` still has `flex-1 min-h-0`, which causes it to claim flex space in the layout even though it's not visible. This pushes the active tab's content to the bottom of the drawer.

### Fix

**File: `src/components/workforce/WorkforceKPISection.tsx`**

Remove `flex-1 min-h-0` from the KPIs `TabsContent` (line 140) since it only needs to scroll its own content, not stretch. Change it to just `mt-2 overflow-y-auto`.

For the Shortage and Surplus tabs (lines 179, 182), keep `flex-1 min-h-0 flex flex-col` but also add `data-[state=inactive]:hidden` so inactive tabs are fully removed from the flex layout instead of just visually hidden.

Alternatively, the simplest fix: add `data-[state=inactive]:hidden` to all three `TabsContent` elements. This ensures inactive tabs don't participate in flex layout at all.

### Technical Detail

- Line 140: Add `data-[state=inactive]:hidden` to KPIs TabsContent
- Line 179: Add `data-[state=inactive]:hidden` to Shortage TabsContent  
- Line 182: Add `data-[state=inactive]:hidden` to Surplus TabsContent

This is a one-line-per-tab className addition -- no structural changes needed.

