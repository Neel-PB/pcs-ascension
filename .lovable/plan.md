

# Table-Style Two-Column Layout for Dropdowns

## Summary

Create a proper table-like column layout inside the dropdown where:
- **Left Column**: Name/Label (flexible width)
- **Right Column**: ID (fixed width, clearly separated)

---

## Visual Goal

```text
CURRENT (text flowing together):
┌──────────────────────────────────────────────────┐
│ Ascension St. Vincent Carmel              F001  │
└──────────────────────────────────────────────────┘

PROPOSED (table-style columns):
┌───────────────────────────────────┬──────────────┐
│ Ascension St. Vincent Carmel      │    40078     │
├───────────────────────────────────┼──────────────┤
│ Amita Health Alexian Brothers     │    40077     │
├───────────────────────────────────┼──────────────┤
│ St. Vincent Indianapolis          │    40001     │
└───────────────────────────────────┴──────────────┘
        ↑ Name Column                  ↑ ID Column
       (flexible)                    (fixed width)
```

---

## Technical Approach

Use CSS Grid with two columns - one flexible for names, one fixed for IDs. Add a subtle left border on the ID column to create visual separation.

---

## File: `src/components/staffing/FilterBar.tsx`

### Update Facility dropdown items (lines 362-368)

```typescript
{availableFacilities.map(facility => (
  <SelectItemNoCheck key={facility.facility_id || facility.id} value={facility.facility_id}>
    <div className="grid grid-cols-[1fr_80px] w-full">
      <span className="truncate pr-3">{facility.facility_name}</span>
      <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border">
        {facility.facility_id}
      </span>
    </div>
  </SelectItemNoCheck>
))}
```

### Update Department dropdown items (lines 409-415)

```typescript
{availableDepartments.map(dept => (
  <SelectItemNoCheck key={dept.department_id} value={dept.department_id}>
    <div className="grid grid-cols-[1fr_80px] w-full">
      <span className="truncate pr-3">{dept.department_name}</span>
      <span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border">
        {dept.department_id}
      </span>
    </div>
  </SelectItemNoCheck>
))}
```

---

## Styling Details

| Element | Styling | Purpose |
|---------|---------|---------|
| Container | `grid grid-cols-[1fr_80px] w-full` | Two columns - flexible + fixed 80px |
| Name Column | `truncate pr-3` | Text truncation, right padding |
| ID Column | `pl-3 border-l border-border` | Left padding + vertical divider line |
| ID Text | `text-xs text-muted-foreground font-mono` | Smaller, muted, monospace |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/staffing/FilterBar.tsx` | Update Facility and Department items from flexbox to CSS Grid with column divider |

