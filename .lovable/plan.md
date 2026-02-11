

# Tabs Navigation Best Practices -- Complete App-Wide Audit and Fix

Based on the UX best practices from the article and a full audit of every tab implementation in the app, here is a comprehensive plan to bring all tabs into compliance.

## Best Practices Summary (from UXD World)

1. **Clear active/inactive contrast** -- use an underline indicator bar for the active tab
2. **Short, single-word labels** -- avoid truncation, keep labels concise
3. **Single row only** -- never wrap tabs to multiple rows
4. **Uniform spacing and padding** -- consistent gap and padding across all tab bars
5. **No nested tabs** -- avoid tabs within tabs (use sections or accordions instead)
6. **Logical ordering** -- tabs should follow the natural user flow
7. **Seamless switching** -- no full page reloads when changing tabs
8. **Consistent label style** -- don't mix icon-only and icon+text in the same bar

## Current State Audit

There are **two categories** of tab violations remaining:

### Category A: Old Pill/Fill Style (3 pages)
These still use the old `bg-background rounded-lg p-1` container with a full-width sliding `bg-primary` background indicator:

| File | Location |
|------|----------|
| `src/pages/admin/AdminPage.tsx` | Admin page (6 tabs with icons) |
| `src/pages/reports/ReportsRegion.tsx` | Reports page (4 tabs) |
| `src/pages/support/SupportPage.tsx` | Support page (4 tabs) |

### Category B: Pill Style Inside Sheets/Modals (5 components)
These use `bg-muted p-1.5 rounded-lg` wrapper around a `TabsList` inside detail sheets:

| File | Location |
|------|----------|
| `src/components/workforce/EmployeeDetailsSheet.tsx` | Details/Comments tabs |
| `src/components/workforce/ContractorDetailsSheet.tsx` | Details/Comments tabs |
| `src/components/workforce/RequisitionDetailsSheet.tsx` | Details/Comments tabs |
| `src/components/workforce/PositionToCloseDetailsSheet.tsx` | Details/Comments tabs |
| `src/components/workforce/PositionToOpenDetailsSheet.tsx` | Details/Comments tabs |

### Category C: Pill Style in Panels/Modals (2 components)
| File | Location |
|------|----------|
| `src/components/notifications/NotificationPanel.tsx` | Feed/Alerts/Actions tabs (`bg-muted rounded-xl p-1.5`) |
| `src/components/staffing/KPIChartModal.tsx` | Chart/Table tabs (uses standard `TabsList`) |

### Already Fixed (no changes needed)
- `src/pages/staffing/StaffingSummary.tsx` -- underline style applied
- `src/pages/positions/PositionsPage.tsx` -- underline style applied
- `src/pages/analytics/AnalyticsRegion.tsx` -- underline style applied
- `src/components/shell/TabNavigation.tsx` -- underline style applied
- `src/components/ui/tabs.tsx` -- shared component already updated

### Label Best Practice Check (already compliant)
- Admin: icons + text (consistent -- all tabs have both icon and text)
- All other tabs use text-only labels (consistent within each bar)
- No labels are excessively long or truncated

## Changes

### Category A: Convert Pill to Underline (Page-Level Tabs)

**1. `src/pages/admin/AdminPage.tsx` (lines 78-111)**
- Remove `bg-background rounded-lg p-1` container and inner `flex` wrapper
- Replace with `flex items-center gap-4 border-b border-border`
- Remove `flex: 1` stretching so tabs are content-sized and left-aligned
- Change active text from `text-primary-foreground` to `text-primary font-semibold`
- Replace the position-calculated full-width `motion.div` background with a per-tab conditional `motion.div` underline (`h-[3px] bg-primary rounded-t-full` at `bottom-0`)
- Keep icons -- they remain consistent (all tabs have icon + text)
- Remove `hover:scale` and `active:scale` effects (not part of the underline pattern)

**2. `src/pages/reports/ReportsRegion.tsx` (lines 39-72)**
- Same conversion: remove pill container, add border-b underline pattern
- Remove `flex: 1`, add `gap-4`
- Per-tab underline indicator with `layoutId="reportsTabIndicator"`

**3. `src/pages/support/SupportPage.tsx` (lines 155-188)**
- Same conversion as above
- Per-tab underline indicator with `layoutId="supportTabIndicator"`

### Category B: Convert Pill to Underline (Inside Sheets)

For the 5 detail sheets, the tabs sit inside a side panel. The change:
- Remove the `bg-muted p-1.5 rounded-lg` wrapper `div`
- Remove `bg-transparent` override on `TabsList` and `grid grid-cols-2`
- Let `TabsList` use its default underline styling (already updated in `tabs.tsx`)
- The `border-b` from the parent div and the TabsList's own border-b will need to be reconciled (remove the outer wrapper's extra border-b padding)

Files:
- `src/components/workforce/EmployeeDetailsSheet.tsx` (lines 49-56)
- `src/components/workforce/ContractorDetailsSheet.tsx` (lines 58-65)
- `src/components/workforce/RequisitionDetailsSheet.tsx` (lines 65-72)
- `src/components/workforce/PositionToCloseDetailsSheet.tsx` (lines 76-83)
- `src/components/workforce/PositionToOpenDetailsSheet.tsx` (lines 75-82)

### Category C: Convert Pill to Underline (Panels/Modals)

**1. `src/components/notifications/NotificationPanel.tsx` (lines 58-71)**
- Remove `bg-muted rounded-xl p-1.5 h-10` from `TabsList`
- Let it use the default underline styling

**2. `src/components/staffing/KPIChartModal.tsx` (lines 125-129)**
- Remove `grid w-full grid-cols-2` from `TabsList` (let tabs be content-sized)
- The default `TabsList` styling from `tabs.tsx` already applies the underline

## Technical Notes

- The shared `src/components/ui/tabs.tsx` component already has the underline indicator built in -- the key fix for Category B and C is simply removing the wrapper `div` overrides (`bg-muted`, `rounded-lg`, `bg-transparent`, `grid`) that were forcing the old pill style
- All page-level custom tab bars (Category A) use inline `motion.div` and need manual conversion to match the pattern already in StaffingSummary/PositionsPage
- No new dependencies or files are needed
- Total files to edit: **10**

