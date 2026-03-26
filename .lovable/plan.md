

## Fix Position to Open Display and Improve Panel Spacing

### Issues
1. **Headcount breakdown format** — Currently shows `ft: 1 FTE × 128` which is hard to read. Should display in a cleaner format matching the screenshot reference: employee_type capitalized, with a clear visual separator between FTE value and headcount.
2. **Overall spacing** — Panels need more breathing room with better padding and consistent vertical spacing.

### Changes

**File: `src/components/forecast/BalanceTwoPanel.tsx`**

1. **HeadcountBreakdown component** (lines 93-108) — Improve formatting:
   - Capitalize `employee_type` (e.g., "ft" → "FT")
   - Change format to: `FT: {fte_value} FTE ▏{hc}` on left, `= {total}` on right
   - Add slightly more padding (`py-1.5`)

2. **Left Panel spacing** (lines 16-88):
   - Increase card padding: `pt-3 px-5 pb-3` (from `pt-1.5 px-4 pb-1.5`)
   - Add `gap-6` between grid columns (from `gap-4`)
   - More space between header and content (`mt-4` instead of `mt-3`)
   - Summary section: add `pt-3` padding above

3. **Right Panel spacing** (lines 117-213):
   - Match card padding: `pt-3 px-5 pb-3`
   - Header gap increase to `gap-6`
   - Position to Close/Open sections: `gap-6` between columns
   - Target footer: `pt-2` padding

4. **Main grid** (line 221) — increase `gap-5` between left and right panels

### Technical Detail
- `employee_type` comes from API as lowercase (e.g., "ft", "prn") — apply `.toUpperCase()` for display
- Use a thin vertical bar `│` as separator between FTE value and headcount for cleaner look

