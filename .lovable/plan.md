

## Remove Feedback Header and Center-Align Filters

### What Changes

**File: `src/pages/feedback/FeedbackPage.tsx`**

1. **Remove the header block** -- Delete the `div` containing the h1 "Feedback" title and the p "View and manage all submitted feedback" subtitle (lines ~129-135 in the current file).

2. **Center-align the search and filters row** -- Change the filters container from `flex items-center gap-3` (left-aligned) to `flex items-center justify-center gap-3` so the search field and filter dropdowns sit in the center of the page.

3. **Remove `max-w-sm` constraint on search** -- Currently the search field is constrained to `max-w-sm` with `flex-1`. Keep it at a fixed reasonable width (e.g., `w-64`) so it doesn't stretch unevenly when centered.

4. **Clean up the outer wrapper** -- Remove the `mb-4` spacing that was between the header and filters since the header is gone. Adjust top padding slightly for breathing room.

### Technical Detail

Current structure:
```
<div className="shrink-0 px-6 py-4 border-b border-border">
  <div className="flex items-center justify-between mb-4">  <!-- REMOVE this block -->
    <h1>Feedback</h1>
    <p>View and manage...</p>
  </div>
  <div className="flex items-center gap-3">  <!-- CENTER this -->
    ...search and filters...
  </div>
</div>
```

New structure:
```
<div className="shrink-0 px-6 py-4 border-b border-border">
  <div className="flex items-center justify-center gap-3">
    ...search and filters (centered)...
  </div>
</div>
```

### Files Changed
- `src/pages/feedback/FeedbackPage.tsx` (remove header, center filters)

