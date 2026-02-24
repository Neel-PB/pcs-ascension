

## Align Feedback Comments Dialog to App Style

### Problem
The Feedback Comments dialog uses a generic layout (avatar + name + text rows) with a plain Textarea composer, which doesn't match the chat-bubble style and pill composer used in the Position Comment Section.

### Changes

**File: `src/components/feedback/FeedbackCommentsDialog.tsx`**

Restyle the dialog internals to match the PositionCommentSection pattern:

1. **Remove avatars** -- replace the avatar-based layout with the label-above-bubble pattern (name above, message in a rounded bubble below)

2. **Chat bubble style** -- wrap comment content in `rounded-2xl rounded-bl-sm bg-muted px-3 py-2` bubbles instead of plain text rows

3. **Timestamp below bubble** -- move timestamp + delete button below the bubble in a compact row (like position comments), with delete only visible on hover

4. **Pill-style composer** -- replace the Textarea + icon button with the same rounded-xl bordered composer used in PositionCommentSection:
   - Bordered container with `rounded-xl border border-border/60 shadow-sm` and focus ring
   - Auto-sizing textarea (using `react-textarea-autosize` which is already installed)
   - Send button inside the pill as a ghost icon button
   - Shortcut hint below

5. **Reduce dialog height** -- change from `h-[400px]` to `h-[350px]` for a tighter feel

6. **Comment spacing** -- use `space-y-3` (matching position comments) instead of `space-y-4`

7. **Empty state** -- use the enhanced empty state pattern with a rounded circle background icon (matching position comments)

### Files Changed
- `src/components/feedback/FeedbackCommentsDialog.tsx` -- restyle comments list and composer to match app-wide chat bubble pattern

