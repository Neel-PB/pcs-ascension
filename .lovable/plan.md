

## Improve Feedback Form UI

### Changes in `src/components/feedback/FeedbackForm.tsx`

1. **Remove icons from submit button** -- remove the `Send` and `Loader2` icons, keep only text labels ("Submit Feedback" / "Submitting...")

2. **Remove emojis from Type dropdown** -- change from "Bug Report" etc. to plain text labels (Bug, Feature, Improvement, Question)

3. **Reorder form fields** for a more logical flow:
   - Title first
   - Type and Priority side-by-side (second)
   - Description (third)
   - Screenshot at the bottom (last, since it's optional)

4. **Tighten spacing** -- reduce form gap from `space-y-4` to `space-y-3` for a more compact layout

5. **Use `ascension` button variant** -- match the app's pill-shaped primary button style instead of the default rectangular button

### Files Changed
- `src/components/feedback/FeedbackForm.tsx`
