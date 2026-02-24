

## Fix KPI Section Drag and Drop on Staffing Summary

### Root Cause
The drag handle for each KPI section (FTE, Volume, Productive Resources) is positioned at `absolute -left-4`, which places it 16px outside the left edge of its container. However, the scrollable parent at `StaffingSummary.tsx` line 542 uses `overflow-auto`, which clips anything outside its bounds. The drag handle is invisible and unreachable.

### Fix

#### 1. `src/components/staffing/DraggableKPISection.tsx` -- Move drag handle inside bounds
- Change the drag handle from `absolute -left-4` to be inline, positioned to the left of the section title using flexbox
- Use a 6-dot grip icon (two columns of 3 dots) instead of the current thin 1.5px bar, making it easier to grab
- Keep the `opacity-0 group-hover:opacity-100` behavior so it appears on hover

Before:
```
<div class="relative group">
  <div class="absolute -left-4 ...">  <!-- clipped by overflow -->
    <div class="w-1.5 h-6 ..." />
  </div>
  <h2>FTE</h2>
</div>
```

After:
```
<div class="relative group flex items-center gap-2">
  <div class="opacity-0 group-hover:opacity-100 cursor-grab ...">
    <GripVertical class="h-4 w-4" />
  </div>
  <h2>FTE</h2>
</div>
```

#### 2. `src/components/staffing/DraggableSectionsContainer.tsx` -- No changes needed
The DndContext, SortableContext, and useSortable logic is correct. The versions are now aligned (core 6.3.1, sortable 8.0.0, modifiers 7.0.0).

### Files Changed
- `src/components/staffing/DraggableKPISection.tsx` -- move drag handle inside container bounds and use grip icon
