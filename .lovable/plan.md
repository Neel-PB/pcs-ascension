

# Add Two-Column Layout (Name + ID) for Facility and Department Dropdowns

## Summary

Update the Facility and Department filter dropdowns to display items in a two-column format:
- **Name** aligned to the left
- **ID** aligned to the right
- No separator line between them

---

## Visual Layout

```text
CURRENT:
┌──────────────────────────────────────┐
│ Ascension St. Vincent Carmel        │
│ Ascension St. Thomas Rutherford     │
│ Ascension Sacred Heart Bay          │
└──────────────────────────────────────┘

PROPOSED:
┌──────────────────────────────────────┐
│ Ascension St. Vincent Carmel   F001 │
│ Ascension St. Thomas Rut...   F002  │
│ Ascension Sacred Heart Bay    F003  │
└──────────────────────────────────────┘

Department (same pattern):
┌──────────────────────────────────────┐
│ Emergency                    D10001 │
│ ICU                          D10002 │
│ Cardiology                   D10003 │
└──────────────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/staffing/FilterBar.tsx`

**1. Update Facility SelectItem (around line 337-338)**

Replace the simple text with a flex container:

```typescript
// BEFORE
{availableFacilities.map(facility => (
  <SelectItem key={facility.facility_id || facility.id} value={facility.facility_id}>
    {facility.facility_name}
  </SelectItem>
))}

// AFTER
{availableFacilities.map(facility => (
  <SelectItem key={facility.facility_id || facility.id} value={facility.facility_id}>
    <div className="flex items-center justify-between w-full gap-4">
      <span className="truncate">{facility.facility_name}</span>
      <span className="text-xs text-muted-foreground font-mono shrink-0">
        {facility.facility_id}
      </span>
    </div>
  </SelectItem>
))}
```

**2. Update Department SelectItem (around line 377-378)**

Apply the same pattern:

```typescript
// BEFORE
{availableDepartments.map(dept => (
  <SelectItem key={dept.department_id} value={dept.department_id}>
    {dept.department_name}
  </SelectItem>
))}

// AFTER
{availableDepartments.map(dept => (
  <SelectItem key={dept.department_id} value={dept.department_id}>
    <div className="flex items-center justify-between w-full gap-4">
      <span className="truncate">{dept.department_name}</span>
      <span className="text-xs text-muted-foreground font-mono shrink-0">
        {dept.department_id}
      </span>
    </div>
  </SelectItem>
))}
```

**3. Update SelectContent width for better spacing**

Make the dropdown content wider to accommodate the two-column layout:

- **Facility SelectContent** (line 326): Add `min-w-[350px]`
- **Department SelectContent** (line 366): Add `min-w-[280px]`

```typescript
// Facility
<SelectContent className="bg-popover border-border z-50 min-w-[350px]">

// Department  
<SelectContent className="bg-popover border-border z-50 min-w-[280px]">
```

---

## Styling Details

| Element | Styling |
|---------|---------|
| Container | `flex items-center justify-between w-full gap-4` |
| Name (left) | `truncate` - truncates long names with ellipsis |
| ID (right) | `text-xs text-muted-foreground font-mono shrink-0` - smaller, muted, monospace font, doesn't shrink |
| No separator | Flexbox with gap handles spacing naturally |

---

## Edge Cases

1. **Unique department names only** (when "All Facilities" is selected) - The current code uses `department_name` as both ID and name in this case. The two-column layout will still work, but ID and name may be identical.

2. **Truncation** - Long facility/department names will truncate with ellipsis to keep the ID visible.

3. **Loading state** - No changes needed; the loading spinner still displays normally.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/staffing/FilterBar.tsx` | Update Facility and Department SelectItem content to use flex layout with name left, ID right |

