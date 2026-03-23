

## Fix: Make Entire Dialog Scroll as One Unit

### Problem
Each section (Region, Market, Facility, Department) has its own `max-h-[140px]`/`max-h-[160px]`/`max-h-[200px]` with `overflow-y-auto`, creating nested scroll areas inside the outer `ScrollArea`. This clips content within each section individually — facilities and departments get cut off even though the dialog has room.

### Fix
Remove the `max-h` and `overflow-y-auto` from all four inner section containers. Let the outer `ScrollArea` handle all scrolling so the entire dialog content scrolls as one continuous list.

### Change: `src/components/admin/AccessScopeDialog.tsx`

- **Line 186**: Region container — remove `max-h-[140px] overflow-y-auto`
- **Line 212**: Market container — remove `max-h-[160px] overflow-y-auto`  
- **Line 251**: Facility list — remove `max-h-[200px] overflow-y-auto`
- **Line 294**: Department list — remove `max-h-[200px] overflow-y-auto`

All four become simple `space-y-0.5 p-1` containers that expand to show all items, and the outer `ScrollArea` (line 177) handles the full-dialog scroll.

