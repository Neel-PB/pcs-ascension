
Goal: In the Facility and Department filter dropdown lists (on /positions), stop truncating long names and show the full text while keeping the same overall two-column styling (Name on the left, ID on the right with a divider).

What I found in the current code
- In `src/components/staffing/FilterBar.tsx` the dropdown list items still use:
  - A fixed grid layout: `grid-cols-[220px_80px]`
  - A truncation class on the name: `className="truncate text-left"`
  - Popover width is still `w-[340px]`
- This combination guarantees cut-off (ellipsis) for longer facility/department names.

Why it still looks the same
- The currently-running code still contains the original truncation + fixed-width grid, so the UI behavior hasn’t changed.

Implementation approach (keeps styling, shows full names)
We’ll keep the same “table-like” two-column look, but make the name column flexible and remove truncation. We’ll also widen the popover so names have more room, while staying responsive on smaller screens.

1) Update Facility dropdown popover width (more room)
File: `src/components/staffing/FilterBar.tsx`
- Change the Facility `<PopoverContent ...>` from `w-[340px]` to something wider and responsive, e.g.:
  - `w-[520px] max-w-[calc(100vw-2rem)]`
This increases space on desktop, but won’t overflow the viewport on smaller screens.

2) Update Facility dropdown rows to remove truncation and use a flexible name column
File: `src/components/staffing/FilterBar.tsx`
- Replace:
  - `grid grid-cols-[220px_80px] w-full`
  - name span: `className="truncate text-left"`
- With a flexible grid that preserves the right-side ID column:
  - `grid grid-cols-[minmax(0,1fr)_80px] w-full`
- Update the name span to allow wrapping / full visibility:
  - remove `truncate`
  - use `whitespace-normal break-words text-left`
- Keep the ID styling, but add `whitespace-nowrap` so the ID doesn’t wrap:
  - `... text-right whitespace-nowrap`

Why grid (not flex):
- With grid, the ID cell naturally stretches to the full row height, so the `border-l` divider stays full-height even when the name wraps to multiple lines. This preserves the “same styling” better than flex.

3) Apply the same exact changes to the Department dropdown
File: `src/components/staffing/FilterBar.tsx`
- Department `<PopoverContent>`: widen + responsive max width
- Department item rows:
  - `grid-cols-[220px_80px]` → `grid-cols-[minmax(0,1fr)_80px]`
  - remove `truncate` from department name
  - allow wrapping on the name
  - keep ID fixed with `whitespace-nowrap`

4) QA / verification steps (what you’ll test after I implement)
- On `/positions`, open Facility dropdown:
  - Confirm long facility names show fully (no ellipsis)
  - Confirm the right-side ID column stays aligned and does not wrap
  - Confirm selected row styling (bg-primary/15 + border) still looks the same
- Open Department dropdown:
  - Confirm long department names show fully (no ellipsis)
  - Confirm search still works by name and by ID
- Check compact screen behavior (below the compact breakpoint) to confirm the popover stays within the viewport (thanks to max-w).

Files that will change
- `src/components/staffing/FilterBar.tsx`
  - Facility popover width + facility item row layout
  - Department popover width + department item row layout

Expected outcome
- Facility/Department dropdown lists keep the same two-column look, but long names are no longer truncated; they will display fully (wrapping if needed) and IDs remain clean and aligned.
