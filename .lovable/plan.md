
# Optimize Page Loading: Unified Loading States for API Data

## Current Issues

1. **Animation Mismatch** - Pages render with animations (motion.div fade-in, y: 20) before data is ready, causing:
   - KPI cards animate in with placeholder/empty values
   - Tab animations run while content is still loading
   - Motion.div elements finish their entry animation, then content pops in late

2. **Multiple Competing Loading States**:
   - `useRBAC().loading` - RBAC permissions
   - `useOrgScopedFilters().isLoading` - Org scopes + filter data
   - `useFilterData().isLoading` - Filter dropdown data
   - `useForecastBalance().isLoading` - Forecast data
   - `useEmployees().isFetching` - Employee table data

3. **Static Content Animates Before Data Ready**:
   - StaffingSummary has KPI sections with motion.div animations
   - KPICard uses `motion.div initial={{ opacity: 0, y: 20 }}` with staggered delays
   - Animations complete before chart data or values are available from API

## Solution Strategy

### 1. Page-Level Loading Guard
Show a content loader until all critical data is ready, THEN render the animated content:

```text
+---------------------------------------------------+
|  Sidebar  |  Header                               |
|           |---------------------------------------|
|           |                                       |
|           |       [LogoLoader]                    |
|           |   "Loading staffing data..."          |
|           |                                       |
+---------------------------------------------------+
                      ↓ Data Ready
+---------------------------------------------------+
|  Sidebar  |  Header                               |
|           |---------------------------------------|
|           |  [Animated FilterBar]                 |
|           |  [Animated Tabs]                      |
|           |  [Animated KPI Cards - all at once]   |
+---------------------------------------------------+
```

### 2. Components to Modify

**StaffingSummary.tsx** - Add loading guard:
```tsx
export default function StaffingSummary() {
  const { loading: rbacLoading } = useRBAC();
  const { isLoading: orgScopedLoading } = useOrgScopedFilters();
  
  // Combined loading state for critical data
  const isInitializing = rbacLoading || orgScopedLoading;
  
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height)-2rem)]">
        <LogoLoader size="lg" />
      </div>
    );
  }
  
  // Now render animated content - all data is ready
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* FilterBar, Tabs, KPIs */}
      </motion.div>
    </>
  );
}
```

**PositionsPage.tsx** - Same pattern:
```tsx
const { isLoading: orgScopedLoading } = useOrgScopedFilters();

if (orgScopedLoading) {
  return (
    <div className="flex items-center justify-center h-full">
      <LogoLoader size="lg" />
    </div>
  );
}
```

### 3. Tab Content Loading Pattern
For tabs with API data (ForecastTab, EmployeesTab, etc.), the pattern is already correct:
- Tab container renders immediately
- Table/KPI content shows LogoLoader while fetching
- This is the "progressive loading" approach we want

### 4. Animation Timing Fix
The key insight: **Animations should only run AFTER critical data is available**

| Component | Current | Fixed |
|-----------|---------|-------|
| StaffingSummary | Animates immediately | Wait for RBAC + OrgScopes |
| PositionsPage | Animates immediately | Wait for OrgScopes |
| KPICard | Staggered delay animation | Same, but parent waits for data first |
| FilterBar | Inline loaders per dropdown | Keep this - already correct |

### 5. Critical vs Non-Critical Data

**Critical (block page render):**
- RBAC permissions (needed for tab visibility)
- Org scoped filters (needed for filter defaults)

**Non-Critical (show inline loaders):**
- Filter dropdown options (inline loader in SelectContent)
- Table data (LogoLoader in table area)
- KPI values when fetched from API (if applicable)

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/staffing/StaffingSummary.tsx` | Add loading guard for RBAC + OrgScopes before rendering |
| `src/pages/positions/PositionsPage.tsx` | Add loading guard for OrgScopes before rendering |

## Technical Implementation

### StaffingSummary Loading Guard
```tsx
// At the top of the component
const { loading: rbacLoading } = useRBAC();
const { isLoading: orgScopedLoading } = useOrgScopedFilters();

// Combined check - don't render animated content until ready
const isInitializing = rbacLoading || (orgScopedLoading && !filtersInitialized);

if (isInitializing) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-var(--header-height)-2rem)]">
      <LogoLoader size="lg" />
    </div>
  );
}
```

### PositionsPage Loading Guard
```tsx
const { isLoading: orgScopedLoading } = useOrgScopedFilters();

if (orgScopedLoading && !filtersInitialized) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-var(--header-height)-2rem)]">
      <LogoLoader size="lg" />
    </div>
  );
}
```

## Benefits

1. **No animation mismatch** - Content only animates once data is ready
2. **Clear loading state** - Users see LogoLoader, then smooth animated transition
3. **Maintains existing patterns** - Tab-level loading for table data stays the same
4. **Better perceived performance** - Single clear transition vs. multiple partial loads

## Important Notes

- The FilterBar inline loaders for dropdown content remain unchanged - those are correct
- Tab content (EmployeesTab, ForecastTab) already has proper LogoLoader patterns
- This change only adds a **page-level** guard for critical initialization data
- KPICard animations will now run all at once after the parent renders (staggered by delay prop)
