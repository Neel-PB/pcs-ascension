

## Fix Tour Tooltip Visibility on Audit Log Step 3

### Root Cause
Step 3 of `adminAuditTourSteps` targets `[data-tour="admin-audit-table"]` with `placement: 'top'`. The audit table is a tall element near the bottom of the scrollable area. When Joyride tries to place the tooltip above it, the tooltip card (with Skip/Next buttons) renders outside the visible area and gets clipped.

### Fix
Change the `placement` of step 3 from `'top'` to `'auto'` so Joyride dynamically picks the best position based on available space. This ensures the tooltip (and its buttons) are always visible regardless of the table height or scroll position.

### Technical Change

**`src/components/tour/tourSteps.ts`** (line ~371)
```diff
  {
    target: '[data-tour="admin-audit-table"]',
    title: 'Audit Table',
    content: 'Each row shows the timestamp, action, target, and who made the change. Click rows with a chevron to expand and see the previous and new values.',
-   placement: 'top',
+   placement: 'auto',
    disableBeacon: true,
  },
```

Single-line change that lets Joyride auto-position the tooltip where there is enough room for the full card including Skip/Next buttons.

