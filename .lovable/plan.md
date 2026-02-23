

## Match Feedback Page Padding with Positions Page

### Problem
The Feedback page has `px-6` on both the filter header and table content areas, which stacks on top of the ShellLayout's `<main>` element that already applies `px-6`. This results in double horizontal padding (48px total) compared to the Positions page which has no extra padding.

### Fix

**File: `src/pages/feedback/FeedbackPage.tsx`**

1. Remove `px-6` from the filter header div (line 158): change `shrink-0 px-6 py-4 border-b border-border` to `shrink-0 py-4 border-b border-border`
2. Remove `px-6` from the table content div (line 209): change `flex-1 min-h-0 overflow-hidden px-6 py-4` to `flex-1 min-h-0 overflow-hidden py-4`

This aligns the Feedback page with the Positions page pattern where padding comes solely from the ShellLayout wrapper.

