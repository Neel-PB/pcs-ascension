

# Fixed-Width Two-Column Layout for Dropdowns

## What You Want

```text
CURRENT (flexible first column):
grid-cols-[1fr_80px]  ← 1fr means "take remaining space" (not fixed!)

┌──────────────────────────────────────────────────┐
│ ASH Pensacola Hospital           │        26012 │  
└──────────────────────────────────────────────────┘

WHAT YOU WANT (fixed widths for both):
grid-cols-[250px_80px]  ← Both columns have fixed pixel widths

┌────────────────────────────┬──────────┐
│ ASH Pensacola Hospital     │    26012 │  ← Label: 250px, left-aligned
│ Sacred Heart Bay MC        │    26013 │  ← ID: 80px, right-aligned
│ Gulf Breeze Campus         │    26017 │
└────────────────────────────┴──────────┘
```

---

## Technical Changes

### File: `src/components/staffing/FilterBar.tsx`

**1. Update Facility dropdown (line 363)**

Change from `1fr` to fixed width:

```typescript
<div className="grid grid-cols-[250px_80px] w-full">
  <span className="truncate text-left">{facility.facility_name}</span>
  <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right">
    {facility.facility_id}
  </span>
</div>
```

**2. Update Department dropdown (line 410)**

Same change:

```typescript
<div className="grid grid-cols-[250px_80px] w-full">
  <span className="truncate text-left">{dept.department_name}</span>
  <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right">
    {dept.department_id}
  </span>
</div>
```

**3. Ensure dropdown content has minimum width**

The `SelectContent` already has `min-w-[280px]` - we should increase this to accommodate `250px + 80px = 330px`:

```typescript
<SelectContent className="bg-popover border-border z-50 min-w-[340px]">
```

---

## Visual Result

```text
┌────────────────────────────┬──────────┐
│ Label (250px, left)        │ ID (80px)│
├────────────────────────────┼──────────┤
│ ASH Pensacola Hospital     │    26012 │
│ Sacred Heart Bay MC        │    26013 │
│ Very Long Facility Name... │    26017 │  ← truncates if too long
└────────────────────────────┴──────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/staffing/FilterBar.tsx` | Change `grid-cols-[1fr_80px]` to `grid-cols-[250px_80px]` for both Facility and Department dropdowns. Update `min-w` on SelectContent to `340px`. |

