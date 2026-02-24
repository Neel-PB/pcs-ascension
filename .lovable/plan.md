

## Feedback Panel: Remove Shortcut Hint and Stack Type/Priority

### Changes

| File | Change |
|------|--------|
| `src/components/feedback/FeedbackPanel.tsx` | Remove the keyboard shortcut hint from the footer. Footer becomes right-aligned with only the Submit button. |
| `src/components/feedback/FeedbackForm.tsx` | Change Type and Priority from `grid grid-cols-2` (side by side) to stacked rows (each full width). |

### Details

1. **Footer** (FeedbackPanel.tsx, ~lines 101-104): Remove the `<p>` element containing the `⌘+Shift+F` hint. Change footer flex from `justify-between` to `justify-end`.

2. **Type/Priority layout** (FeedbackForm.tsx, ~line 108): Replace `grid grid-cols-2 gap-3` with `space-y-3` so Type and Priority each take a full row.

