

## Remove Label Rotation, Widen Modal for Horizontal Labels

### Problem
The 28-day chart x-axis labels are rotated at -45 degrees. Instead, the modal should be wider so labels fit horizontally without rotation.

### Changes

**`src/components/staffing/KPIChartModal.tsx`**

1. **Line 149** — Widen dialog from `max-w-5xl` to `max-w-[95vw]` so it uses nearly the full viewport width, giving enough horizontal space for 28 labels:
   ```typescript
   "max-w-[95vw]"
   ```

2. **Lines 1065-1070, 1099-1104, 1128-1133** — Remove rotation from all three area chart XAxis instances. Change from angled to horizontal:
   ```typescript
   // Before
   tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
   interval={0}
   angle={-45}
   textAnchor="end"
   height={50}

   // After
   tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
   interval={0}
   ```
   Remove `angle`, `textAnchor`, and `height` props — defaults will render labels horizontally.

### Files Changed
- `src/components/staffing/KPIChartModal.tsx`

