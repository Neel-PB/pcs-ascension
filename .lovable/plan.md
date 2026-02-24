

## Rearrange Feedback Panel: Close on Top, Submit at Bottom

### What Changes

Move the Close button into the header row (top-right) and keep only the Submit button in the footer, giving the form content maximum vertical space.

### Layout (Top to Bottom)

```text
+-------------------------------------------+
| Submit Feedback              [Close btn]  |  <-- Header with close
+-------------------------------------------+
|                                           |
|  Title *                                  |
|  Type *        Priority                   |
|  Description *                            |
|  Screenshot (Optional)                    |
|                                           |  <-- Scrollable content area
+-------------------------------------------+
| Cmd+Shift+F to toggle    [Submit Feedback]|  <-- Footer with submit only
+-------------------------------------------+
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/feedback/FeedbackPanel.tsx` | 1. Add Close button (outline, icon or text) to the header row (right-aligned). 2. Remove Close button from footer. 3. Footer simplified to keyboard hint + Submit button only. |

### Details

1. **Header**: Add `justify-between` to the header flex row. Add a ghost/outline Close button on the right side with an X icon.
2. **Footer**: Remove the Close button. Keep the keyboard shortcut hint on the left and the Submit Feedback button on the right.
3. No changes to form content or spacing -- the content area already uses `flex-1 overflow-y-auto` to fill available space.

