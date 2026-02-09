

# Show Full Names in Facility and Department Filter Dropdowns

## Problem

In the Facility and Department filter dropdowns, long facility/department names are being truncated (e.g., "Ascension Saint Thomas Hickm..."). The current layout uses a fixed 220px width for the name column with truncation applied.

---

## Current vs. Proposed

```text
CURRENT (names cut off):
┌────────────────────────────────────────┐
│ Ascension Saint Thomas Hickm...  46004 │
│ Ascension Saint Thomas Midto...  46001 │
│ Ascension Saint Thomas River...  46005 │
└────────────────────────────────────────┘

PROPOSED (full names visible):
┌─────────────────────────────────────────────────┐
│ Ascension Saint Thomas Hickman Hospital  46004 │
│ Ascension Saint Thomas Midtown          46001 │
│ Ascension Saint Thomas River Park       46005 │
└─────────────────────────────────────────────────┘
```

---

## Technical Changes

### 1. Update Facility Dropdown Layout

**File:** `src/components/staffing/FilterBar.tsx`

**Line 365** - Increase popover width:
```typescript
// FROM:
<PopoverContent className="w-[340px] p-0 bg-popover border-border z-50" align="start">

// TO:
<PopoverContent className="w-[420px] p-0 bg-popover border-border z-50" align="start">
```

**Lines 411-416** - Use flexible layout for facility items:
```typescript
// FROM:
<div className="grid grid-cols-[220px_80px] w-full">
  <span className="truncate text-left">{facility.facility_name}</span>
  <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right">
    {facility.facility_id}
  </span>
</div>

// TO:
<div className="flex w-full items-center justify-between gap-2">
  <span className="text-left">{facility.facility_name}</span>
  <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right whitespace-nowrap">
    {facility.facility_id}
  </span>
</div>
```

---

### 2. Update Department Dropdown Layout

**Line 456** - Increase popover width:
```typescript
// FROM:
<PopoverContent className="w-[340px] p-0 bg-popover border-border z-50" align="start">

// TO:
<PopoverContent className="w-[420px] p-0 bg-popover border-border z-50" align="start">
```

**Lines 502-507** - Use flexible layout for department items:
```typescript
// FROM:
<div className="grid grid-cols-[220px_80px] w-full">
  <span className="truncate text-left">{dept.department_name}</span>
  <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right">
    {dept.department_id}
  </span>
</div>

// TO:
<div className="flex w-full items-center justify-between gap-2">
  <span className="text-left">{dept.department_name}</span>
  <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right whitespace-nowrap">
    {dept.department_id}
  </span>
</div>
```

---

## Summary of Changes

| Location | Change |
|----------|--------|
| Line 365 | Facility popover width: `340px` → `420px` |
| Lines 411-416 | Facility: Replace fixed grid with flex layout, remove `truncate` |
| Line 456 | Department popover width: `340px` → `420px` |
| Lines 502-507 | Department: Replace fixed grid with flex layout, remove `truncate` |

---

## Notes

- The flex layout allows the name to use available space while keeping the ID fixed-width
- Removing `truncate` ensures full names are always visible
- Adding `whitespace-nowrap` to the ID ensures it stays on one line
- The wider popover (420px) provides comfortable room for long facility names like "Ascension Saint Thomas Hickman Hospital"
- This maintains the existing two-column visual style (name left, ID right with divider) while showing complete text

