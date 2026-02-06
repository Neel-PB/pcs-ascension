

# Right-Align ID Column in Dropdown Layout

## Summary

Add `text-right` to the ID column so all IDs align on the right side of their fixed-width column, creating a clean table-like appearance.

---

## Visual Goal

```text
CURRENT (ID left-aligned in column):
┌───────────────────────────────────┬──────────────┐
│ Ascension St. Vincent Carmel      │ 40078        │
│ Amita Health                      │ 40077        │
│ St. Vincent                       │ 1            │
└───────────────────────────────────┴──────────────┘

PROPOSED (ID right-aligned in column):
┌───────────────────────────────────┬──────────────┐
│ Ascension St. Vincent Carmel      │        40078 │
│ Amita Health                      │        40077 │
│ St. Vincent                       │            1 │
└───────────────────────────────────┴──────────────┘
```

---

## Technical Changes

### File: `src/components/staffing/FilterBar.tsx`

**1. Update Facility dropdown ID span (line 365)**

Add `text-right` class:

```typescript
<span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right">
  {facility.facility_id}
</span>
```

**2. Update Department dropdown ID span (line 412)**

Same change:

```typescript
<span className="text-xs text-muted-foreground font-mono pl-3 border-l border-border text-right">
  {dept.department_id}
</span>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/staffing/FilterBar.tsx` | Add `text-right` to ID column spans (2 locations) |

