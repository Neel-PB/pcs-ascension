
# Fix Facility and Department Dropdown Layout

## Summary

Two issues to fix:
1. **Width alignment** - Name and ID need to be at the left and right edges of the dropdown
2. **Department ID** - Show actual `department_id` from the database, not the name

---

## Visual Goal

```text
FACILITY DROPDOWN (350px wide):
┌────────────────────────────────────────────────────┐
│ Ascension St. Vincent Carmel              F001    │
│ Ascension St. Thomas Rutherford           F002    │
│ Ascension Sacred Heart Bay                F003    │
└────────────────────────────────────────────────────┘
 ↑                                           ↑
 Left edge                              Right edge

DEPARTMENT DROPDOWN (280px wide):
┌─────────────────────────────────────────────┐
│ Emergency                           D10001 │
│ ICU                                 D10002 │
│ Cardiology                          D10003 │
└─────────────────────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/staffing/FilterBar.tsx`

**1. Fix Facility SelectItem layout (lines 338-345)**

Update the flex container to properly span the full width:

```typescript
<SelectItem key={facility.facility_id || facility.id} value={facility.facility_id}>
  <div className="flex items-center justify-between w-full gap-4">
    <span className="truncate">{facility.facility_name}</span>
    <span className="text-xs text-muted-foreground font-mono shrink-0">
      {facility.facility_id}
    </span>
  </div>
</SelectItem>
```

The current implementation looks correct, but the Radix Select component may constrain the inner content width. We need to ensure the SelectContent has proper sizing.

**2. Fix Department data to preserve actual IDs**

The root issue is in `getAvailableDepartments()` (lines 145-217). When no facility is selected, it creates fake department objects where `department_id = department_name`. 

We need to preserve the actual department IDs. Update the fallback cases to keep the real `department_id`:

**Lines 166-171 (Facility restrictions case):**
```typescript
// BEFORE: Creates fake IDs
const uniqueNames = new Set<string>();
filteredDepts.forEach(d => uniqueNames.add(d.department_name));
return Array.from(uniqueNames).sort().map(name => ({
  department_id: name,
  department_name: name
}));

// AFTER: Keep first occurrence with real ID for each unique name
const seenNames = new Map<string, { department_id: string; department_name: string }>();
filteredDepts.forEach(d => {
  if (!seenNames.has(d.department_name)) {
    seenNames.set(d.department_name, {
      department_id: d.department_id,
      department_name: d.department_name
    });
  }
});
return Array.from(seenNames.values()).sort((a, b) => 
  a.department_name.localeCompare(b.department_name)
);
```

Apply the same fix to:
- **Lines 183-190** (Market restrictions case)
- **Lines 202-209** (Region restrictions case)
- **Lines 213-216** (No restrictions case) - needs to use `allDepartments` instead of `uniqueDepartmentNames`

**3. Update the "No restrictions" case (lines 213-216)**

```typescript
// BEFORE
return uniqueDepartmentNames.map(name => ({
  department_id: name,
  department_name: name
}));

// AFTER
const seenNames = new Map<string, { department_id: string; department_name: string }>();
allDepartments.forEach(d => {
  if (!seenNames.has(d.department_name)) {
    seenNames.set(d.department_name, {
      department_id: d.department_id,
      department_name: d.department_name
    });
  }
});
return Array.from(seenNames.values()).sort((a, b) => 
  a.department_name.localeCompare(b.department_name)
);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/staffing/FilterBar.tsx` | Update `getAvailableDepartments()` to preserve real department_id values instead of using department_name as a placeholder |
