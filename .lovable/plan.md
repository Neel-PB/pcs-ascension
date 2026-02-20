

## Make User Guides More Usable and Friendly

### Problems with Current UI

1. **Search bar is oversized** -- the full-width rounded pill with large search icon takes up too much space and looks more like a homepage hero search than an inline filter
2. **Section rows are dense and cluttered** -- chevron, icon, title, description, step count badge, done badge, Go & Start button, and reset button all crammed into one line
3. **Step items are plain text** -- no numbering, no icons, no visual grouping; they look like raw debug output
4. **No progress indication** -- users can't see how many steps they've completed within a section
5. **Category tabs inside the card** compete visually with the outer Support page tabs

### Proposed Changes (single file: `UserGuidesTab.tsx`)

**1. Compact Search Field**
- Switch from the large `SearchField` pill to a standard `Input` with a search icon prefix, matching the style used elsewhere in the app
- Smaller, cleaner, less dominant

**2. Cleaner Section Rows**
- Move the "Go & Start" button and reset into a hover/always-visible action area
- Add a subtle progress bar or fraction (e.g., "Done" or step count) on the right
- Give each section row a light card-like background on hover with rounded corners
- Keep the chevron expand, icon, title, and description but space them better

**3. Numbered Step Items**
- Add step numbers (1, 2, 3...) as small circular indicators on each step
- Add a subtle play/arrow icon on hover to indicate clickability
- Slightly larger click targets with better padding
- Group steps visually with a numbered vertical line instead of a plain border-left

**4. Visual Polish**
- Add a brief intro text above the search: "Browse interactive walkthroughs for every feature. Expand a section to jump to a specific step."
- Better empty state with an illustration prompt
- Smoother expand/collapse animation

### Layout After Changes

```text
Browse interactive walkthroughs for every feature.
Expand a section to jump to a specific step.

[Search tours and steps...     x]

[Staffing] [Positions] [Admin] [Feedback] [Overlays]

  [>] [icon] Staffing Summary                 30 steps  [Done]  [> Start]
              KPI cards, trend charts...                         [Reset]
       Expands to:
       1  Filter Bar
       2  Region Filter  
       3  Market Filter
       ...
       14  FTE Variance          <-- highlighted if search match

  [>] [icon] Position Planning                6 steps          [> Start]
              FTE skill-shift analysis...
```

### Technical Details

**File: `src/components/support/UserGuidesTab.tsx`**

- Replace `SearchField` with a standard `Input` wrapped in a relative div with a `Search` icon and clear button
- Add intro paragraph above the search
- Refactor section rows:
  - Wrap each row in a subtle `rounded-lg border border-transparent hover:border-border hover:bg-accent/30` container
  - Move action buttons to a dedicated right-aligned column
  - Clean up badge sizing and spacing
- Refactor step sub-items:
  - Add numbered circle indicator (`index + 1`) before each step title
  - Use `pl-10` indent with a dashed/dotted vertical connector line
  - Add `Play` icon on hover via group-hover
  - Larger touch target: `py-2 px-3` instead of `py-1.5 px-2.5`
- Add brief helper text at the top of the component

### Files Changed

| File | Change |
|------|--------|
| `src/components/support/UserGuidesTab.tsx` | Replace search field, add intro text, improve section row layout, add numbered step items with better affordance |

