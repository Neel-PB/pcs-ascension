

## Fix: Filter skill-shift data by detected nursing category

### Problem
When a department is selected, we correctly fetch **all** records (without `nursingFlag` filter) to auto-detect the category. However, after detection, `displayVarianceData` and `dynamicSkillGroups` still use **all** unfiltered `skillShiftData`. This means:

1. If a department has only non-nursing records, auto-detection sets `staffCategory = 'non-nursing'` — but the data is correct anyway since all records are non-nursing.
2. The real issue: the `nursing_flag` comparison uses strict `=== 'Y'` / `=== 'N'`, but the API may return lowercase (`'y'`/`'n'`) or other variants. If neither matches, `hasNursing` and `hasNonNursing` are both `false`, so the `else` branch defaults to `'nursing'`.

### Fix — `src/pages/staffing/PositionPlanning.tsx`

**1. Case-insensitive nursing_flag comparison in auto-detection (~line 540):**

```typescript
useEffect(() => {
  if (isDepartmentSelected && skillShiftData && skillShiftData.length > 0 && !autoDetected) {
    const hasNursing = skillShiftData.some(r => r.nursing_flag?.toUpperCase() === 'Y');
    const hasNonNursing = skillShiftData.some(r => r.nursing_flag?.toUpperCase() === 'N');
    if (hasNonNursing && !hasNursing) {
      setStaffCategory('non-nursing');
    } else if (hasNursing && !hasNonNursing) {
      setStaffCategory('nursing');
    } else {
      // Mixed or unknown — default to nursing
      setStaffCategory('nursing');
    }
    setAutoDetected(true);
  }
}, [isDepartmentSelected, skillShiftData, autoDetected]);
```

**2. Filter data by detected category when department is selected (~lines 553-565):**

Add a filtered data memo that applies the `staffCategory` filter when a department is selected:

```typescript
const filteredSkillShiftData = useMemo(() => {
  if (!skillShiftData?.length) return [];
  if (!isDepartmentSelected) return skillShiftData;
  // Filter by detected category
  const flag = staffCategory === 'nursing' ? 'Y' : 'N';
  return skillShiftData.filter(r => r.nursing_flag?.toUpperCase() === flag);
}, [skillShiftData, isDepartmentSelected, staffCategory]);
```

Then use `filteredSkillShiftData` in both `dynamicSkillGroups` and `displayVarianceData` instead of `skillShiftData`.

### Scope
Single file, ~15 lines changed. Ensures non-nursing departments like 10276 correctly show without Target FTE and Variance columns.

