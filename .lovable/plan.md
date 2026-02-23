

## Make FTE Activity Cards More Compact and Left-Aligned

### Problem
- FTE/Shift activity log bubbles are right-aligned (like sent messages), but they should be left-aligned like regular comments
- The card layout is too spread out with large padding, dividers, and vertical spacing
- The "by Demo Admin" attribution is right-aligned inside the card

### Changes

**File: `src/components/positions/PositionCommentSection.tsx`**

#### 1. Make activity logs left-aligned (same as regular comments)
- Line 286: Remove the conditional `items-end` for activity logs -- always use `items-start`
- Line 288: Remove the conditional `text-right pr-1` -- always use `pl-1`; show both the activity label and the user name together (e.g., "FTE Change -- Demo Admin")
- Line 293: Remove the conditional `flex-row-reverse` for activity log rows
- Line 321: Remove the conditional `flex-row-reverse` for the inner message row
- Line 326: Keep the primary-tinted styling but change rounded corner from `rounded-br-sm` to `rounded-bl-sm` (matching left-aligned bubbles)

#### 2. Make FteActivityCard more compact
- Reduce padding on the bubble from `px-4 py-3` to `px-3 py-2`
- Replace `divide-y divide-border/30` with `space-y-0` (remove divider lines)
- Reduce `py-2` on each ActivityFieldRow to `py-1` for tighter vertical spacing
- Move "by {displayName}" from inside the card to the label above the bubble (combined with "FTE Change")
- Remove the "by" footer row entirely from inside FteActivityCard
- Keep the comment quote but reduce its padding

#### 3. Make ActivityFieldRow more compact
- Reduce vertical padding from `py-2` to `py-1`
- Reduce label width from `w-14` to `w-12` and use `text-[11px]` instead of `text-xs`
- Tighten the gap from `gap-3` to `gap-2`

#### 4. Make ShiftActivityCard more compact
- Remove the "by" footer from inside the card
- Reduce spacing from `space-y-3` to `space-y-1`

#### 5. Combine label above bubble
- For activity logs, show "FTE Change -- {displayName}" as the label above the bubble instead of just "FTE Change", and remove the "by" line from inside the card

### Result
- All entries (comments + activity logs) are left-aligned in a clean timeline
- Activity cards are visually tighter with less wasted space
- User attribution moves to the header line above the bubble, keeping the card itself focused on data
- No information is lost -- all FTE, Reason, Expiry, and comment fields remain visible
