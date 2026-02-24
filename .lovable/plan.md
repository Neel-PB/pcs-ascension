

## Simplify Global Search -- Remove Navigation Section

### Problem
The global search currently shows a "Navigation" section with static page links (Staffing Summary, Positions, etc.) that the user doesn't want. They want a clean, simple search that only shows database results.

### Changes

#### `src/components/shell/GlobalSearchCommand.tsx`
- Remove the entire "Navigation" `CommandGroup` block that lists sidebar modules
- Remove the `useDynamicSidebar` import and hook call since it's no longer needed
- Keep only the entity search groups (Employees, Contractors, Requisitions, Feedback)
- The search will show nothing until the user types 2+ characters, then display matching results from the database

### Files Changed
- `src/components/shell/GlobalSearchCommand.tsx` -- remove Navigation group and sidebar dependency

