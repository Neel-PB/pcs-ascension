

## Fix Consistent Spacing and Table Fill Height

### The Calculation (as you described)

```text
100vh (full viewport)
  - var(--header-height)         -> Header
  - 32px (shell py-4)            -> Shell top + bottom padding
  = Available content area

Within that area (flex column):
  1. Filter bar + its padding     -> natural height (~60px)
  2. Tab navigation               -> natural height (~52px)
  3. Section header (title/toggles/legend) -> natural height (~48px)
  4. TABLE = ALL REMAINING SPACE  -> flex-1 min-h-0
```

Each section gets uniform spacing between them. No hardcoded pixel offsets for the table.

### Current Spacing Problems

| Gap | Current | Issue |
|-----|---------|-------|
| Above filters | `py-2` (8px top) | Shell already provides 16px top via `py-4` -- the extra `py-2` adds inconsistent padding |
| Below filters -> tabs | `py-2` bottom (8px) | Too tight compared to other gaps |
| Below tabs | `mb-6` (24px) | Larger than other gaps |
| Between section header and table | `gap-6` (24px) | Matches tabs but not filter gap |

### Solution: Uniform `gap-4` (16px) Between All Sections

Instead of mixing `py-2`, `mb-6`, and `gap-6`, use a single consistent `gap-4` (16px) between all vertical sections within the flex column. This matches the shell's own `py-4` padding rhythm.

### Files to Change

**1. StaffingSummary.tsx**
- Remove `py-2` wrapper around FilterBar (shell's `py-4` provides top padding)
- Remove `mb-6` from tab navigation
- Add `gap-4` to the flex column container so all children get uniform 16px spacing
- Keep `flex-1 min-h-0` on the tab content area

**2. PositionPlanning.tsx**
- Change `gap-6` to `gap-4` on the outer flex container for consistent spacing

**3. VarianceAnalysis.tsx**
- Change `gap-6` to `gap-4` on the outer flex container for consistent spacing

**4. ForecastTab.tsx**
- Change `gap-6` to `gap-4` on the outer flex container for consistent spacing

### Result
- Uniform 16px vertical rhythm between filters, tabs, section header, and table
- Table fills exactly the remaining viewport height (flex-1)
- No page scroll, no bottom gap
- Shell's `py-4` provides the top/bottom breathing room

