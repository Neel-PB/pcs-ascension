

## Fix Tab/KPI Width Misalignment on Staffing Page

### Problem

The tab toggle bar spans the full content width, but the KPI cards below are indented with an extra `pl-6` (24px left padding) applied to the `DraggableSectionsContainer`. This makes the KPI sections narrower than the tabs, creating a visual misalignment visible only on the Staffing Summary page.

### Root Cause

In `src/components/staffing/DraggableSectionsContainer.tsx` (line 121), the KPI sections wrapper has `pl-6`:

```
<div className="space-y-8 pl-6" data-tour="kpi-sections">
```

This extra left padding pushes all KPI cards inward relative to the tabs and filter bar above.

### Fix

**File: `src/components/staffing/DraggableSectionsContainer.tsx`**

Remove `pl-6` from the container className on line 121:

```
Before: className="space-y-8 pl-6"
After:  className="space-y-8"
```

This single change aligns the KPI card sections flush with the tabs and filter bar. No other pages are affected since this component is only used on the Staffing Summary tab.

