

# Center-Align Page-Level Toggle Tabs

## Change

Wrap the `ToggleButtonGroup` in a centered container on every page where it appears, so the tab pills sit in the middle of the content area instead of left-aligned.

## Files to Edit

### 1. `src/components/ui/toggle-button-group.tsx`
- The simplest approach: the outer `<div>` already accepts a `className` prop. No changes needed here.

### 2. Pages using `ToggleButtonGroup` directly (add `flex justify-center` wrapper or pass centered className)

Each page renders the toggle group inside a `<div>`. Update the parent wrapper to center it:

- **`src/pages/staffing/StaffingSummary.tsx`** -- wrap toggle group div with `flex justify-center`
- **`src/pages/positions/PositionsPage.tsx`** -- update the `flex-shrink-0 mb-6` div to include `flex justify-center`
- **`src/pages/analytics/AnalyticsRegion.tsx`** -- update the `mb-6` div to include `flex justify-center`
- **`src/pages/reports/ReportsRegion.tsx`** -- same pattern
- **`src/pages/admin/AdminPage.tsx`** -- same pattern
- **`src/pages/support/SupportPage.tsx`** -- same pattern

### 3. `src/components/shell/TabNavigation.tsx`
- Update the outer `<div>` to include `flex justify-center` so route-based tab navigation is also centered

All changes are adding `flex justify-center` to the existing wrapper divs around the toggle button group.

