

## Make Activity Log Comments More Compact

### Problem
The FTE/Shift activity cards in the comment timeline take up too much vertical space. The field rows (FTE, REASON, EXPIRY) have generous padding and the overall bubble is spacious.

### Changes

**File: `src/components/positions/PositionCommentSection.tsx`**

1. **ActivityFieldRow** -- reduce vertical padding from `py-1` to `py-0.5` and shrink the label font from `text-[11px]` to `text-[10px]`

2. **FteActivityCard** -- reduce comment quote top padding from `pt-1.5` to `pt-1`

3. **Activity bubble padding** -- reduce from `px-3 py-2` to `px-2.5 py-1.5` for activity log entries only

4. **Arrow icon size** -- shrink `ArrowRight` in inline rows from `h-3.5 w-3.5` to `h-3 w-3`

5. **Comment spacing** -- reduce the gap between comments from `space-y-4` to `space-y-3`

6. **Timestamp row** -- reduce top gap slightly by keeping existing compact sizing

### Result
Each activity card will be visually tighter while remaining readable -- roughly 20-25% less vertical space per entry.

### Files Changed
- `src/components/positions/PositionCommentSection.tsx`

