

## Fix: First Row Active FTE and Shift Cell Styling in Positions Module

### Problem
In the Employees and Contractors tabs, the first row's "Active FTE" and "Shift" cells are wrapped in a `<div data-tour="...">` element for the guided tour system. This wrapper div has no sizing classes, so it collapses and doesn't fill the grid cell -- breaking the cell alignment and hover behavior on the first row only.

### Solution
Add `className="w-full h-full"` to both tour wrapper divs so they stretch to fill the cell container, making the first row visually identical to all other rows.

### Technical Details

**File 1: `src/pages/positions/EmployeesTab.tsx`**

Line 261 -- change:
```tsx
return row.id === firstRowId ? <div data-tour="positions-active-fte-cell">{cell}</div> : cell;
```
to:
```tsx
return row.id === firstRowId ? <div data-tour="positions-active-fte-cell" className="w-full h-full">{cell}</div> : cell;
```

Line 271 -- change:
```tsx
return row.id === firstRowId ? <div data-tour="positions-shift-cell">{cell}</div> : cell;
```
to:
```tsx
return row.id === firstRowId ? <div data-tour="positions-shift-cell" className="w-full h-full">{cell}</div> : cell;
```

**File 2: `src/pages/positions/ContractorsTab.tsx`**

Same changes on lines 255 and 265.

No other files affected.

