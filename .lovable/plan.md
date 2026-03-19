

## Fix: "Unknown" Skill Type in FTE Charts

**Problem**: Some skill-shift records have an empty `skill_mix` field, causing them to be labeled "Unknown" in Hired FTE, Vacancy, and other skill-mix pie/bar charts.

**Fix**: Use `broader_skill_mix_category` as a fallback before defaulting to "Unknown".

### Change

**File: `src/pages/staffing/StaffingSummary.tsx`**

Update three locations where `skill_mix` is used as the grouping key:

1. **`skillMixPieData`** (line 224): Change `r.skill_mix || 'Unknown'` → `r.skill_mix || r.broader_skill_mix_category || 'Other'`

2. **`vacancyBySkillMix`** (line 254): Change `r.skill_mix || 'Unknown'` → `r.skill_mix || r.broader_skill_mix_category || 'Other'`

3. Any other occurrence of `skill_mix || 'Unknown'` in this file — apply the same pattern.

This ensures records without a granular `skill_mix` value are grouped by their broader category (e.g., "Nursing", "Allied Health") instead of showing as "Unknown".

