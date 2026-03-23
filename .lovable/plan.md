

## Fix: Proper Scroll Heights for Access Scope Dialog

### Problem
With all `max-h` removed, sections with many items (Facility ~30, Department ~339) make the dialog content taller than the viewport. The `ScrollArea` wrapping the content doesn't have proper height constraints, so it overflows and clips Facility/Department entirely.

### Solution
Give each section appropriate height limits based on item count:
- **Region** (2 items): No constraint — show all
- **Market** (~12 items): Cap at `max-h-[200px]` with its own scroll
- **Facility** (~30 items): Cap at `max-h-[240px]` with its own scroll
- **Department** (~339 items): Cap at `max-h-[280px]` with its own scroll

This way all four sections are always visible on screen, each with internal scrolling for long lists. The outer `ScrollArea` stays as a safety net.

### Change: `src/components/admin/AccessScopeDialog.tsx`

1. **Line 169** — Increase dialog max height: `max-h-[90vh]` (from 85vh) for more room
2. **Line 186** — Region container: keep as-is (no max-h, only 2 items)
3. **Line 212** — Market container: add `max-h-[200px] overflow-y-auto`
4. **Line 251** — Facility list container: add `max-h-[240px] overflow-y-auto`
5. **Line 294** — Department list container: add `max-h-[280px] overflow-y-auto`

Each scrollable section gets its own internal scroll so all four sections remain visible and accessible within the dialog.

