

## Fix: Volume Settings and NP Settings Table Scrolling

### Problem
The `EditableTable` in both the Volume Settings (`SettingsTab.tsx`) and NP Settings (`NPSettingsTab.tsx`) tabs cannot scroll because the parent containers lack height constraints. The virtualized table needs a strict height chain (`overflow-hidden` + `min-h-0` on all ancestors) to establish its internal scroll context.

Currently both tabs return:
```
<div className="space-y-4">
  <div> (stats banner) </div>
  <div> <EditableTable /> </div>
</div>
```

This `space-y-4` div has no height constraint, so the table renders at its natural height and the VirtualizedTableBody scroll area never activates.

### Solution
Apply the same height-constraining pattern used elsewhere: make the tab root a flex column that fills available space, with `overflow-hidden` and `min-h-0` on intermediate containers so the table can scroll internally.

### File 1: `src/pages/staffing/SettingsTab.tsx` (line 238)
Change the root wrapper from `<div className="space-y-4">` to a flex column with constrained height:
```tsx
<div className="flex flex-col gap-4 h-[calc(100vh-var(--header-height)-220px)] overflow-hidden">
```
And add `min-h-0 flex-1 overflow-hidden` to the table's wrapper div (line 280):
```tsx
<div data-tour="volume-settings-table" ... className="flex-1 min-h-0 overflow-hidden">
```

### File 2: `src/pages/staffing/NPSettingsTab.tsx`
Apply the same pattern: constrained flex column root and `flex-1 min-h-0 overflow-hidden` on the table wrapper div.

This ensures the height chain is unbroken from the page layout down to the VirtualizedTableBody, enabling the table's internal scroll.

