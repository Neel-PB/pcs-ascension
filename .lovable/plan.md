

## Fix KPI Drag and Drop -- @dnd-kit Version Mismatch

### Problem
The drag and drop for KPI sections is broken due to incompatible `@dnd-kit` package versions:
- `@dnd-kit/core`: ^6.3.1 (old)
- `@dnd-kit/sortable`: ^10.0.0 (new, expects core v7+)
- `@dnd-kit/modifiers`: ^9.0.0 (new, expects core v7+)

These packages must be on compatible versions to work together.

### Fix
Downgrade `@dnd-kit/sortable` and `@dnd-kit/modifiers` to versions compatible with `@dnd-kit/core` v6:

#### `package.json`
Change the dependencies to aligned versions:
- `@dnd-kit/core`: `^6.3.1` (keep as-is)
- `@dnd-kit/sortable`: `^8.0.0` (downgrade from ^10 -- v8 is compatible with core v6)
- `@dnd-kit/modifiers`: `^7.0.0` (downgrade from ^9 -- v7 is compatible with core v6)

No code changes are needed -- the component APIs (`useSortable`, `DndContext`, `SortableContext`, etc.) are the same across these versions. The drag handles on section titles and column headers will work again once the packages are aligned.

### Files Changed
- `package.json` -- downgrade @dnd-kit/sortable and @dnd-kit/modifiers to core-v6-compatible versions

