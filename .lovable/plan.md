

## Refine Submit Feedback Panel UI

### Overview
Apply a comprehensive UI polish to the Feedback form and panel: tighter spacing, better visual hierarchy, and moving the Submit button into the fixed footer alongside the Close button.

### Changes

#### 1. `src/components/feedback/FeedbackPanel.tsx` -- Footer restructure
- Move the "Submit Feedback" action into the fixed footer bar, next to the Close button
- The footer will have: keyboard hint on the left, Close (outline) + Submit (ascension) buttons on the right
- Pass a `formRef` or use a form ID so the footer Submit button can trigger the form submission
- Remove the `data-tour="feedback-footer"` shortcut hint styling cleanup

#### 2. `src/components/feedback/FeedbackForm.tsx` -- Layout and spacing refinements
- Add a `formId` prop so the form element gets an `id` attribute (allows external submit button)
- Remove the inline Submit button (it moves to the panel footer)
- Reduce `space-y-3` to `space-y-4` with tighter internal `space-y-1.5` for label-to-input gaps (instead of `space-y-2`)
- Use `text-sm font-medium` for labels consistently
- Add subtle separator between the Type/Priority row and Description
- Make the screenshot section more compact: reduce dashed border padding from `p-6` to `p-4`

#### 3. `src/components/feedback/ScreenshotCapture.tsx` -- Compact styling
- Reduce padding inside the dashed upload zone from `p-6` to `p-4`
- Tighten button gap from `gap-3` to `gap-2`
- Reduce preview image height from `h-40` to `h-32`

### Files Changed
- `src/components/feedback/FeedbackPanel.tsx` -- restructure footer with Submit button
- `src/components/feedback/FeedbackForm.tsx` -- tighter spacing, remove inline submit, add form ID
- `src/components/feedback/ScreenshotCapture.tsx` -- compact styling adjustments

