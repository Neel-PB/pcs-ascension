

## Add Tour Guide for the Feedback Management Page

### Overview
The Feedback submission panel already has a 3-step overlay tour. This plan adds a standard page-level tour for the Feedback management page (`/feedback`) that guides users through the search, filters, table, status workflows, and comments.

### Tour Steps (5 steps)

1. **Search** -- `[data-tour="feedback-search"]` -- "Search feedback by title or description to quickly find specific submissions."
2. **Filters** -- `[data-tour="feedback-filters"]` -- "Filter feedback by Type, PCS Status, and PB Status to narrow down the list. Combine multiple filters for precise results."
3. **Feedback Table** -- `[data-tour="feedback-table"]` -- "Each row shows the title, type, description, screenshot, author, and timestamps. Click the type or priority badges to change them inline."
4. **Status Management** -- `[data-tour="feedback-pcs-status"]` -- "Manage the dual-status workflow: PCS Status (Pending, Approved, Disregard, Backlog) controls triage. Setting PCS to Disregard or Backlog automatically locks PB Status to Closed."
5. **Comments & Actions** -- `[data-tour="feedback-comments"]` -- "Click the comments icon to view or add discussion on any feedback item. Use the trash icon to delete a submission (requires confirmation)."

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Add a new exported array `feedbackPageTourSteps: Step[]` with the 5 steps above

#### `src/pages/feedback/FeedbackPage.tsx`
- Import `Joyride`, `TourTooltip`, `useTour`, and the new `feedbackPageTourSteps`
- Render a Joyride instance with the same config pattern used in StaffingTour
- Add `data-tour` attributes:
  - `data-tour="feedback-search"` on the `SearchField`
  - `data-tour="feedback-filters"` on a wrapper `div` around the three `Select` filters
  - `data-tour="feedback-table"` on the table container `div`
- Add auto-scroll logic in the callback for off-screen columns

#### `src/components/feedback/FeedbackTableRow.tsx`
- Add `data-tour="feedback-pcs-status"` on the first row's PCS Status `TableCell` (conditionally, only on the first row via a prop or index check)
- Add `data-tour="feedback-comments"` on the first row's Comments `TableCell`

Since the tour targets need to exist on the first table row specifically, the approach will be to pass an `isFirstRow` prop from `FeedbackPage` to `FeedbackTableRow` and only apply the `data-tour` attributes when `isFirstRow` is true.

### Tour Trigger Behavior
- Auto-starts on first visit to `/feedback` (localStorage key: `helix-tour-feedback-page-completed`)
- Re-triggerable via "Take a Tour" dropdown using the `feedback-page` key

