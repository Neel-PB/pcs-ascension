

## Fix Target Volume Popover: Date Labels & Width

### Problems (from screenshot)
1. **X-axis dates showing as `2025-032025-04...`** — the `format(parsed, "MMM")` is producing just month abbreviations but with 12+ months they overlap. The real issue: the format should include year context like `MMM''yy` (e.g., "Mar'25") and the labels need angle/rotation or shorter format to fit.
2. **Popover too narrow for 12 months** — `w-[420px]` is insufficient for 12 x-axis labels.

### Changes

#### `src/components/staffing/TargetVolumePopover.tsx`

1. **Fix date format** (line 63): Change `format(parsed, "MMM")` → `format(parsed, "MMM''yy")` to show `Mar'25` style labels, matching the app's standard from `generateLast12MonthLabels()` in `utils.ts`.

2. **Increase popover width** (line 116): Change `w-[420px]` → `w-[520px]` to give 12 monthly labels room to breathe.

3. **Angle X-axis labels** (line 125): Add `angle={-45}` and `textAnchor="end"` to the XAxis tick, and increase bottom margin to accommodate rotated labels. This prevents overlap with 12+ data points.

### Files Changed
- `src/components/staffing/TargetVolumePopover.tsx`

