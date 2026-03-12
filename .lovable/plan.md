

## Fix: `nursing_flag` is a boolean, not a string

The API returns `nursing_flag` as `true`/`false` (boolean), not `'Y'`/`'N'` (string). Calling `.toUpperCase()` on a boolean crashes.

### Change — `src/pages/staffing/PositionPlanning.tsx`

**Auto-detection effect (~line 540-541):**
```typescript
// Before:
const hasNursing = skillShiftData.some(r => r.nursing_flag?.toUpperCase() === 'Y');
const hasNonNursing = skillShiftData.some(r => r.nursing_flag?.toUpperCase() === 'N');

// After:
const hasNursing = skillShiftData.some(r => r.nursing_flag === true || r.nursing_flag === 'Y');
const hasNonNursing = skillShiftData.some(r => r.nursing_flag === false || r.nursing_flag === 'N');
```

**Filter memo (~line 558):**
```typescript
// Before:
return skillShiftData.filter(r => r.nursing_flag?.toUpperCase() === flag);

// After:
const isNursing = staffCategory === 'nursing';
return skillShiftData.filter(r => {
  if (typeof r.nursing_flag === 'boolean') return r.nursing_flag === isNursing;
  return (r.nursing_flag === 'Y') === isNursing;
});
```

**Also update the `nursingFlag` query parameter in `useSkillShift`** — currently sends `'Y'`/`'N'` string but the API may expect `true`/`false`. Need to check the hook. If the hook converts it, no change needed there.

### Scope
Single file, ~6 lines changed. Handles both boolean and string formats for `nursing_flag`.

