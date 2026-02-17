

## Fix Tour Tooltip Visibility on Admin Audit Log (and other tabs)

### Root Cause
In `AdminPage.tsx`, the content area wraps all tab content in:
```
<div className="flex-1 min-h-0 overflow-hidden">
```
This `overflow-hidden` clips the Joyride tooltip when it tries to position itself above or below elements inside the container. The spotlight overlay appears (as seen in the screenshot), but the tooltip card with Skip/Next buttons renders outside the visible bounds and gets clipped.

### Fix
Change `overflow-hidden` to `overflow-auto` (or `overflow-y-auto`) on the content wrapper in `AdminPage.tsx`. This still enables scrolling for overflowing content but does not clip absolutely/fixed-positioned elements like the tour tooltip from rendering.

Alternatively, if `overflow-hidden` is needed to prevent layout shifts, we can scope it: only apply `overflow-hidden` when a tour is NOT running, or wrap the scrollable content inside a nested container so the Joyride tooltip floater (which uses portals) isn't clipped.

However, the simplest and most reliable fix is:

### Technical Change

**`src/pages/admin/AdminPage.tsx`** (line ~101)
- Change `overflow-hidden` to `overflow-y-auto` on the content wrapper div
- This allows the tooltip to render without being clipped while still supporting scrollable content

```diff
- <div className="flex-1 min-h-0 overflow-hidden">
+ <div className="flex-1 min-h-0 overflow-y-auto">
```

This is a single-line change that fixes tooltip visibility across all Admin tabs (Users, Feed, RBAC, Audit Log, Settings).

