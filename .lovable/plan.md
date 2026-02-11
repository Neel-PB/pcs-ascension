

# Apply Helix Design System Tab Style

## Visual Style
The Helix tabs use an **underline indicator** style instead of the current filled/gradient background:
- **Selected tab**: Bold text in primary color + 3px bottom underline in primary color
- **Unselected tab**: Regular weight text in muted color
- **Bottom border**: A subtle divider line runs across the full width of the tab group
- **No background container**: No rounded background or fill -- clean and minimal
- Left-aligned on desktop (tabs sized to content, not stretched)

## Files to Update

### 1. `src/components/ui/tabs.tsx` (Radix Tabs -- shared component)
- **TabsList**: Remove `bg-background rounded-md p-0.5`. Add a full-width bottom border (`border-b border-border`). Make it `inline-flex` with a gap.
- **TabsTrigger**: Replace the filled `motion.div` indicator (gradient background) with a bottom-positioned underline bar (`h-[3px]` at the bottom). Selected text becomes `text-primary font-semibold`, unselected stays `text-muted-foreground`.

### 2. `src/components/shell/TabNavigation.tsx` (Route-based navigation tabs)
- Remove the `bg-background rounded-xl p-2 shadow-soft` container styling.
- Replace the `bg-gradient-primary rounded-lg` active indicator with a 3px bottom underline.
- Update text colors: active = `text-primary font-semibold`, inactive = `text-muted-foreground`.

### 3. `src/pages/positions/PositionsPage.tsx` (Inline tabs)
- Remove `bg-background rounded-lg p-1` container.
- Replace `bg-primary rounded-sm` sliding indicator with a bottom underline.
- Update text styling to match: active = `text-primary font-semibold`, inactive = `text-muted-foreground`.

### 4. `src/pages/analytics/AnalyticsRegion.tsx` (Inline tabs)
- Same treatment: remove filled background container, switch to underline indicator.

## Technical Details
- The animated `motion.div` indicator remains for smooth transitions, but repositioned to the bottom of the tab (`bottom-0, left-0, right-0, h-[3px]`) instead of covering the full area.
- All three implementations get the same visual treatment for consistency across the app.

