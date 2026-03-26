

## Capitalize Shift Values Everywhere in UI

### Problem
Shift override values ("day"/"night") display lowercase in the activity log comments within the Position Comment Section, even though the ShiftCell table display was already fixed.

### Changes

**File: `src/components/positions/PositionCommentSection.tsx`**

In the `ShiftActivityCard` component, capitalize `shiftOld` and `shiftNew` before rendering:

- Line 152-153: After extracting the values, capitalize them:
```tsx
const rawOld = (metadata.shift_old ?? metadata.shiftOld ?? metadata.old_value) as string | null;
const rawNew = (metadata.shift_new ?? metadata.shiftNew ?? metadata.new_value) as string | null;
const capitalize = (s: string | null) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const shiftOld = capitalize(rawOld);
const shiftNew = capitalize(rawNew);
```

No other changes needed — the three render points on lines 162, 167, 170 already reference `shiftOld`/`shiftNew` and will automatically pick up the capitalized values.

