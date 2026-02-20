

## Apply Shrink-Wrap Layout to Positions Module

### Problem
The Positions module uses `space-y-6` (24px gaps), `mb-6` extra margin, `py-2` padding, and `flex-1` on table containers -- causing tables to stretch to fill remaining viewport even with few rows. The Staffing module already uses a standardized pattern with `gap-4` (16px), `h-full`, and `min-h-0 max-h-full`.

### How the Layout Works (Viewport Calculation)

The layout is a pure CSS Flexbox chain -- no manual `calc(100vh - ...)` needed for the content area:

```text
ShellLayout (<main>)
  height: calc(100vh - var(--header-height))   <-- only calc in the system
  overflow-y: auto                              <-- page-level scroll
  padding: 16px (py-4 px-4)

  PositionsPage (outer div)
    h-full              <-- fills parent (100vh - header - padding)
    flex flex-col
    gap-4               <-- uniform 16px between all children
    overflow-hidden     <-- no double scrollbar

    FilterBar           <-- flex-shrink-0, natural height (~48px)
    ToggleButtonGroup   <-- flex-shrink-0, natural height (~44px)
    Tab Content         <-- min-h-0 max-h-full (shrink-wrap / cap)

      Search + Buttons  <-- flex-shrink-0, natural height (~40px)
      Table Card        <-- min-h-0 max-h-full (content-sized, capped)
```

Key principle: `flex-1` forces stretching. `min-h-0 max-h-full` allows content to determine height but caps at available space.

### Files to Change

**1. `src/pages/positions/PositionsPage.tsx`**
- Line 101: Change `space-y-6` to `gap-4` (standardize 16px vertical rhythm)
- Line 120: Remove `mb-6` from tab section (gap handles spacing already)
- Line 131: Change `flex-1 min-h-0` to `min-h-0 max-h-full` on content area

**2. `src/pages/positions/EmployeesTab.tsx`**
- Line 282: Change outer `flex-1 min-h-0` to `min-h-0 max-h-full`
- Line 325: Change table wrapper `flex-1 min-h-0` to `min-h-0 max-h-full`
- Line 335: Change EditableTable className `flex-1 min-h-0` to `min-h-0 max-h-full`

**3. `src/pages/positions/ContractorsTab.tsx`**
- Same three changes as EmployeesTab (identical layout structure)

**4. `src/pages/positions/RequisitionsTab.tsx` (Open Position)**
- Same three changes as EmployeesTab (identical layout structure)

**5. `src/pages/positions/OpenRequisitionTab.tsx`**
- Wrap the bare `EditableTable` in `<div className="min-h-0 max-h-full overflow-hidden">`

**6. `src/pages/positions/ContractorRequisitionTab.tsx`**
- Same wrapping as OpenRequisitionTab

### Result
- Few rows: table card is short, page background visible below
- Many rows: table fills available space and scrolls internally
- Uniform gap-4 (16px) spacing matching the Staffing module exactly
- No hardcoded pixel offsets or `calc()` in the Positions module itself
