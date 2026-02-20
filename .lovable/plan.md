

## Fix Content Area Left/Right Padding to Match Header

### Problem

The main content area (`ShellLayout`) uses `px-4` (16px) horizontal padding, while the header uses `px-6` (24px). This creates a visual misalignment where the tabs, filter bar, and KPI cards appear to extend further left than the header content above them. The right side looks correct because the scrollbar absorbs some space there.

### Change

**File: `src/components/shell/ShellLayout.tsx`**

Update the `<main>` element's padding from `px-4` to `px-6` to match the header's inner `px-6` padding. This ensures the left edge of content (filter selects, toggle tabs, KPI cards) aligns vertically with the "Position Control System" title in the header.

```
Before: className="px-4 py-4 bg-shell-elevated ..."
After:  className="px-6 py-4 bg-shell-elevated ..."
```

This is a single-line change that affects all pages uniformly (Staffing, Positions, Analytics, Reports, Support, Admin) since they all render inside ShellLayout.

