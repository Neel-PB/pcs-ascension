
# Update Staffing Page Tabs to Underline Style

## Problem
The Staffing Summary page (`src/pages/staffing/StaffingSummary.tsx`) still uses the old filled/pill tab style with a sliding background indicator. This was missed in the previous tab style update.

## Change

Update lines 545-578 in `src/pages/staffing/StaffingSummary.tsx` to match the underline style already applied to the other tab components:

- Remove the `bg-background rounded-lg p-1` container
- Replace the full-width sliding `bg-primary rounded-sm` background indicator with a bottom-positioned 3px underline bar
- Remove `flex: 1` stretching so tabs are content-sized and left-aligned
- Update text styles: active = `text-primary font-semibold`, inactive = `text-muted-foreground`
- Add `border-b border-border` to the container for the horizontal rule
- Add `gap-4` between tabs for consistent spacing

## Technical Details

The current implementation uses a position-calculated `motion.div` that spans the full tab width as a background. This will be replaced with a per-tab conditional `motion.div` underline (same pattern used in PositionsPage and AnalyticsRegion), using `layoutId="staffingTabIndicator"` for animated transitions.
