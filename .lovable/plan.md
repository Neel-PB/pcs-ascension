

## Polish Feedback Table Visual Readability

### Problems Identified (from screenshot)
1. Select trigger chevrons create visual noise -- every badge has a small dropdown arrow that clutters the row
2. Badge colors feel inconsistent -- "In Progress" orange is too loud, and the overall palette needs refinement
3. Priority "High" uses red/destructive -- should use orange per app's shortage color semantics
4. Date text is too small and muted to read easily
5. Actions column icons (camera, "0" count, trash) feel cramped and visually disconnected
6. Cell heights are inconsistent due to double-padding (wrapper `px-4 py-1` + select trigger padding)

### Solution

**File: `src/config/feedbackColumns.tsx`**

**1. Cleaner Select triggers (remove visual noise)**
- Hide the chevron icon on select triggers using `[&>svg]:hidden` so badges appear clean
- Widen triggers slightly so the full badge text is never clipped
- Remove the extra `py-1` wrapper padding; let cells use consistent `h-full` with centered flex content

**2. Refined color palette (brand-aligned)**
- **Type badges**: Keep current colors but ensure consistency
  - Bug: `bg-destructive/10 text-destructive` (red tint, appropriate for bugs)
  - Feature: `bg-amber-100 text-amber-700` (warmer, more readable)
  - Improve: `bg-primary/10 text-primary` (brand blue)
  - Question: `bg-purple-100 text-purple-700`
- **ACS Status badges**:
  - Pending: `bg-blue-100 text-blue-700`
  - Approved: `bg-emerald-100 text-emerald-700`
  - Disregard: `bg-muted text-muted-foreground`
  - Backlog: `bg-amber-100 text-amber-700`
- **PB Status badges**:
  - Pending: `bg-blue-100 text-blue-700`
  - In Progress: `bg-amber-100 text-amber-700`
  - Resolved: `bg-emerald-100 text-emerald-700`
  - Closed: `bg-muted text-muted-foreground`
- **Priority**: Use `text-orange-600` for High (not destructive red), `text-amber-600` for Medium, `text-muted-foreground` for Low -- matching the app's orange shortage semantics

**3. Date column readability**
- Change from `text-xs text-muted-foreground` to `text-sm text-foreground` so dates are actually readable
- Wrap in `CellButton` for consistent padding and hover behavior

**4. Actions column polish**
- Increase column width from 130 to 140px
- Add `gap-2` instead of `gap-1` for breathing room between icons
- Style the comment count as a proper small text next to the icon, not a cramped "0"
- Use `text-muted-foreground` for camera and comments icons for a subtler look
- Keep only the trash icon as `text-destructive`

**5. Consistent cell layout**
- Remove the extra `<div className="px-4 py-1">` wrappers from select cells
- Instead, use a single `<div className="px-2 flex items-center h-full">` wrapper that aligns with the grid row height
- Author and Date cells use `CellButton` (which provides `px-4 py-2` automatically) for consistency with other columns

### Technical Detail -- Select Trigger Cleanup

Current (noisy):
```
<SelectTrigger className="h-7 w-[95px] text-xs border-none bg-transparent hover:bg-muted/50 rounded-lg px-1">
```

Proposed (clean):
```
<SelectTrigger className="h-7 border-none bg-transparent hover:bg-muted/50 rounded-lg px-1.5 [&>svg]:hidden [&>span]:flex [&>span]:items-center">
```

The `[&>svg]:hidden` hides the chevron so the badge alone acts as the clickable trigger, significantly reducing visual clutter while keeping full Select functionality.

### Files Changed
- `src/config/feedbackColumns.tsx` (single file, all visual changes)
