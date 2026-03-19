

## Fix: Consistent Skill Group Order and Title Case in Planned/Active Resources

**Problem**: The skill category rows (overheads, support staff, clinical staff, other) appear in arbitrary order depending on the API response, and their names are not consistently capitalized (e.g., "overheads" instead of "Overheads").

**Solution**: Apply a fixed display order and title-case formatting to the `buildSkillGroups` function.

### Changes

**File: `src/pages/staffing/PositionPlanning.tsx`**

1. **Add a title-case helper** near the top:
```tsx
function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
```

2. **Define a fixed category order** constant:
```tsx
const SKILL_CATEGORY_ORDER = [
  'clinical staff',
  'support staff',
  'overheads',
  'other',
];
```

3. **Update `buildSkillGroups`** (lines 65-78): Apply title-case to category names and sort the output array according to the fixed order. Unknown categories appear at the end.

```tsx
function buildSkillGroups(records: SkillShiftRecord[]): SkillGroup[] {
  const categoryMap = new Map<string, Set<string>>();
  records.forEach(r => {
    const cat = r.broader_skill_mix_category || 'Other';
    if (!categoryMap.has(cat)) categoryMap.set(cat, new Set());
    categoryMap.get(cat)!.add(r.skill_mix);
  });

  return Array.from(categoryMap.entries())
    .map(([cat, skills]) => ({
      id: cat.toLowerCase().replace(/\s+/g, '_'),
      name: toTitleCase(cat),
      skills: Array.from(skills),
      defaultExpanded: false,
    }))
    .sort((a, b) => {
      const aIdx = SKILL_CATEGORY_ORDER.indexOf(a.id.replace(/_/g, ' '));
      const bIdx = SKILL_CATEGORY_ORDER.indexOf(b.id.replace(/_/g, ' '));
      const aOrder = aIdx === -1 ? 999 : aIdx;
      const bOrder = bIdx === -1 ? 999 : bIdx;
      return aOrder - bOrder;
    });
}
```

This ensures:
- Rows always appear in the order: Clinical Staff, Support Staff, Overheads, Other
- All category names use title case (first letter of each word capitalized)
- Consistent across all filter combinations

