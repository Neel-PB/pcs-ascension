
## Enhanced Global Search

### Overview
Transform the global search from navigation-only to a comprehensive search across all entities: pages, employees, contractors, requisitions, and feedback items. The search will query the database on each keystroke (debounced) and display categorized results.

### Current State
- `GlobalSearchCommand` only searches sidebar navigation items (6 static pages)
- Uses `cmdk` CommandDialog with a pill-shaped search input
- Triggered by clicking the SearchField in the header or pressing Cmd+K

### Changes

#### 1. `src/components/shell/GlobalSearchCommand.tsx` -- Major rewrite
- Add debounced search state using `useDebouncedSearch` hook
- When the debounced value has 2+ characters, fire parallel queries to:
  - **Positions (Employees)**: Search `positions` table where `positionLifecycle = 'Filled'` and NOT contingent, matching on `employeeName`, `employeeId`, `jobTitle`, `positionNum` (limit 5)
  - **Positions (Contractors)**: Search `positions` where `positionLifecycle = 'Filled'` AND contingent, matching on `employeeName`, `employeeId` (limit 5)
  - **Positions (Requisitions)**: Search `positions` where `positionLifecycle != 'Filled'`, matching on `positionNum`, `jobTitle`, `departmentName` (limit 5)
  - **Feedback**: Search `feedback` table matching on `title`, `description` (limit 5)
- Keep the existing **Navigation** group (always shown, filtered by cmdk built-in matching)
- Add new `CommandGroup` sections for each entity type with results
- Each result item navigates to the appropriate page with context:
  - Employees -> `/positions?tab=employees`
  - Contractors -> `/positions?tab=contractors`
  - Requisitions -> `/positions?tab=requisitions`
  - Feedback -> `/feedback`
- Show a loading state while queries are in flight
- Show "Type 2+ characters to search..." when input is too short

#### 2. `src/components/ui/search-field.tsx` -- No changes needed
The search field trigger in the header remains as-is (the reference screenshot matches the current style).

#### 3. `src/components/ui/command.tsx` -- No changes needed
The CommandDialog styling is already correct.

### Technical Details

- Use `useQuery` with `enabled: debouncedValue.length >= 2` for each entity search
- Use Supabase `or` filter with `ilike` for text matching across multiple columns
- Each query is limited to 5 results to keep the dropdown fast and compact
- Navigation items continue to use cmdk's built-in filtering (no database query needed)
- All queries run in parallel via separate `useQuery` hooks

### Result Item Format
- **Employees**: Show employee name, job title, facility name
- **Contractors**: Show employee name, job title, facility name
- **Requisitions**: Show position number, job title, department name
- **Feedback**: Show title, type badge, priority

### Files Changed
- `src/components/shell/GlobalSearchCommand.tsx` -- add entity search queries and result groups
