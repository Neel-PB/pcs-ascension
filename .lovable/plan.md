

## Increase Donut Chart Height for Hired FTEs & Vacancy Rate

### Problem
The 400x400 containers are being clipped by the `max-h-[85vh]` dialog constraint combined with `overflow-hidden`. The charts need more visible space.

### Changes

**File: `src/components/staffing/KPIChartModal.tsx`**

1. **Increase dialog max-height** (line 153): `max-h-[85vh]` → `max-h-[92vh]` to give charts more room

2. **Increase nested donut containers** (line 934): `w-[400px] h-[400px]` → `w-[440px] h-[440px]`, update radii:
   - Inner: `outerRadius={95}` → `110`, `innerRadius={55}` → `65`
   - Outer: `outerRadius={170}` → `195`, `innerRadius={115}` → `135`

3. **Increase dual donut containers** (line 997): `w-[400px] h-[400px]` → `w-[440px] h-[440px]`, update radii:
   - `outerRadius={170}` → `195`, `innerRadius={120}` → `140`

4. **Update overflow** (line 199): Change `overflow-hidden` → `overflow-y-auto` so content scrolls if needed instead of clipping

