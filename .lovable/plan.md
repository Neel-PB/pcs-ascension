
## What’s actually causing the “can’t scroll / can’t search / popover jumps around” behavior

### 1) Scrolling is broken because our `ScrollArea` needs a real height (not just `max-height`)
Your `ScrollArea` component is Radix-based and renders like this:

- Root: `overflow-hidden`
- Viewport: `h-full w-full`

That means **the Root must have an explicit height**.  
Right now we’re using:

- `MultiSelectChips`: `<ScrollArea className="max-h-[250px]">`
- `AccessScopeManager` Facility/Department: `<ScrollArea className="max-h-[300px]">`

`max-h-*` alone does not give the Root a real height, so the viewport expands to content and you get **no internal overflow**, hence **no wheel scrolling**. The popover then grows/shrinks with search results, causing repositioning.

### 2) The popover “moves” because its height is changing while Radix tries to keep it in view
When you search, the list length changes → popover height changes → Radix Popover recomputes placement/collision → it shifts (sometimes flips).

Fixing the list to a stable height makes the popover position stable.

---

## Plan to fix (no behavior changes to your filter rules—only UX)

### A) Fix scrolling + stabilize layout in `MultiSelectChips` (Region + Market)
**File:** `src/components/ui/multi-select-chips.tsx`

1. Change the list container from `max-h-[250px]` to a fixed height:
   - Replace: `className="max-h-[250px]"`
   - With: `className="h-[250px]"`  
   Result: Radix ScrollArea actually becomes scrollable.

2. Prevent small width/layout “jumps” when scrollbar appears/disappears:
   - Add `overflow-y-scroll` behavior to keep the gutter stable.
   - Easiest path:
     - either switch to a native div scroller (`div.h-[250px].overflow-y-auto`) inside the popover
     - or keep `ScrollArea` but ensure the viewport always scrolls and we apply `overflow-y-scroll` to the viewport wrapper (details in implementation notes).

3. Improve search-focus reliability:
   - Update `onOpenAutoFocus` to call `event.preventDefault()` and then focus the input.
   - This prevents Radix from focusing something else and helps ensure typing always goes into the search field immediately.

4. Optional but recommended: reset search when popover closes
   - When `open` becomes `false`, set `search` back to `""` so the list doesn’t stay filtered the next time.

### B) Fix scrolling + stabilize layout in Facility/Department popovers
**File:** `src/components/admin/AccessScopeManager.tsx`

1. Change Facility list `ScrollArea` from `max-h-[300px]` to `h-[300px]`
2. Change Department list `ScrollArea` from `max-h-[300px]` to `h-[300px]`

This will:
- Make wheel scrolling work
- Keep popover height stable while searching and selecting

3. Reduce “sheet scroll stealing” while you try to scroll inside the popover (common inside a side sheet):
   - Add `onWheelCapture={(e) => e.stopPropagation()}` to the scroll container (the `ScrollArea` root or the inner scrolling element).
   - This ensures the wheel scroll affects the list, not the underlying sheet.

4. Keep popover placement consistent:
   - Explicitly set popover content to open on bottom and align start (you already align start), plus keep collision behavior:
     - `side="bottom"` (and keep `align="start"`)
   - With fixed list heights, collision-driven movement should mostly stop.

### C) Verify with a quick end-to-end test path (what I’ll test after the changes)
1. Admin → Users → Edit user → Access Scope Restrictions
2. Region → Add → type in search → scroll list
3. Market → Add → type in search → scroll list
4. Facility → Add → type in search → scroll list
5. Department → Add → type in search → scroll list
6. Confirm: popover no longer jumps when filtering results

---

## Implementation notes (so it matches your app patterns)
- We will keep your current selection styling (bg highlight + border, no checkmarks).
- We will not change your cascading logic—only the dropdown mechanics and stability.
- We will keep dropdown backgrounds solid (`bg-popover`) and z-index high.

---

## Files to change
1. `src/components/ui/multi-select-chips.tsx`
2. `src/components/admin/AccessScopeManager.tsx`

---

## Expected outcome
- Search inputs always accept typing immediately
- Lists scroll properly with mouse wheel/trackpad
- Popover height stays stable while filtering, so its position doesn’t jump around
- Works consistently inside the Edit User sheet
