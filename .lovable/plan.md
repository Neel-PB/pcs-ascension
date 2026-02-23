
## Unify Action Button Colors and Add Tooltips

### What Changes

**`src/config/feedbackColumns.tsx`**

1. **Unified icon color**: Change the delete button from `text-destructive` to `text-muted-foreground` so all three action icons (camera, comments, delete) share the same muted color. Add `hover:text-destructive` only on hover for the delete button to signal its destructive nature.

2. **Add tooltips to all three action buttons**:
   - **Screenshot button**: Wrap in `TooltipProvider/Tooltip` with label "View Screenshot" (or "No Screenshot" when disabled)
   - **Delete button**: Wrap the `AlertDialogTrigger` button in `TooltipProvider/Tooltip` with label "Delete Feedback"

**`src/components/feedback/FeedbackCommentsDialog.tsx`**

3. **Add tooltip to comments button**: Wrap the `DialogTrigger` button in `TooltipProvider/Tooltip` with label "Comments (N)" or "No Comments" when count is 0

### Technical Detail

- Import `Tooltip, TooltipContent, TooltipProvider, TooltipTrigger` in both files
- For the delete button, the tooltip wraps the `AlertDialogTrigger` so both tooltip and alert dialog work together -- tooltip on hover, alert on click
- For the screenshot button (already in `feedbackColumns.tsx`), add tooltip around the `DialogTrigger` and the disabled button
- All icons use `text-muted-foreground` as base color; delete gets `hover:text-destructive` on hover

### Files Changed
- `src/config/feedbackColumns.tsx` -- unify delete icon color, add tooltips to screenshot and delete buttons
- `src/components/feedback/FeedbackCommentsDialog.tsx` -- add tooltip to comments trigger button
