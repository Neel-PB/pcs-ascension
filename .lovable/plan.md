

# Restructure Access Scope Layout: Label + Add on Same Row

## Goal
Move the "Add" button to be alongside the label (e.g., "Region [Add]") on the same row, with selected chips displayed below on a separate row. The popover dropdown opens below without disturbing the layout.

---

## Current Layout

```text
┌─────────────────────────────────────────┐
│ 🌐 Region                               │  ← Header row
├─────────────────────────────────────────┤
│ [Region 1 ×]  [+ Add]                   │  ← Chips + Add button mixed
└─────────────────────────────────────────┘
```

## Target Layout

```text
┌─────────────────────────────────────────┐
│ 🌐 Region              [+ Add]          │  ← Header row (label + button)
├─────────────────────────────────────────┤
│ [Region 1 ×]                            │  ← Chips row (or "No restrictions")
│                                         │
│ (Popover appears here when Add clicked) │
└─────────────────────────────────────────┘
```

---

## Changes

### File: `src/components/ui/multi-select-chips.tsx`

**Structure Change:**

Current structure (lines 77-194):
```tsx
<div className="space-y-2">
  {label && (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  )}
  
  <div className="flex flex-wrap items-center gap-2">
    {chips...}
    <Popover>  <!-- Add button + dropdown here -->
      <PopoverTrigger>...</PopoverTrigger>
      <PopoverContent>...</PopoverContent>
    </Popover>
  </div>
</div>
```

New structure:
```tsx
<div className="space-y-2">
  {/* Header row: label + Add button */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
    <Popover>
      <PopoverTrigger>
        <Button>[+ Add]</Button>
      </PopoverTrigger>
      <PopoverContent>...</PopoverContent>
    </Popover>
  </div>
  
  {/* Chips row (separate) */}
  <div className="flex flex-wrap gap-2">
    {chips or "No restrictions"}
  </div>
</div>
```

**Key Changes:**
1. Move the `<Popover>` component from inside the chips row to the header row
2. Use `justify-between` to push the Add button to the right side of the header
3. Keep chips on a separate row below

---

### File: `src/components/admin/AccessScopeManager.tsx`

Apply the same layout restructuring to the **Facility** (lines 399-507) and **Department** (lines 509-617) sections:

**Facility Section - Current (simplified):**
```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Building2 /> Facility
  </div>
  
  <div className="flex flex-wrap items-center gap-2">
    {chips...}
    <Popover>...</Popover>  <!-- Add button here -->
  </div>
</div>
```

**Facility Section - New:**
```tsx
<div className="space-y-2">
  {/* Header: Label + Add button */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Building2 /> Facility
    </div>
    <Popover>...</Popover>  <!-- Add button moved here -->
  </div>
  
  {/* Chips row (separate) */}
  <div className="flex flex-wrap gap-2">
    {chips or "No restrictions"}
  </div>
</div>
```

Same pattern for Department section.

---

## Visual Result

```text
┌──────────────────────────────────────────────┐
│ 🌐 Region                         [+ Add]    │
│ ─────────────────────────────────────────────│
│ [Region 1 ×]                                 │
├──────────────────────────────────────────────┤
│ 📍 Market                         [+ Add]    │
│ ─────────────────────────────────────────────│
│ [FLORIDA ×]                                  │
├──────────────────────────────────────────────┤
│ 🏢 Facility                       [+ Add]    │
│ ─────────────────────────────────────────────│
│ [Sacred Heart Bay MC 26013 ×]                │
├──────────────────────────────────────────────┤
│ 📑 Department                     [+ Add]    │
│ ─────────────────────────────────────────────│
│ No restrictions                              │
└──────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/multi-select-chips.tsx` | Move Popover to header row, use `justify-between`, keep chips on separate row |
| `src/components/admin/AccessScopeManager.tsx` | Apply same restructuring to Facility and Department custom sections |

---

## Expected Outcome

- Each filter level has a clean header row with Icon + Label on the left and "+ Add" button on the right
- Selected chips (or "No restrictions" text) appear on a separate row below the header
- When clicking Add, the popover opens below without shifting the label or other elements
- Layout remains stable regardless of how many chips are selected

