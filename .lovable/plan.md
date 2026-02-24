

## Make Feedback Trigger Visible to All Authenticated Users

### Problem

The floating feedback trigger button (bottom-right pill) is gated behind `hasPermission('feedback.access')` in `App.tsx`, which hides it from roles like `director` that don't have that permission. The user wants the trigger visible to everyone -- only the feedback management page (`/feedback`) should be restricted.

### Change

| File | Change |
|------|--------|
| `src/App.tsx` (~line 105-106) | Remove `hasPermission('feedback.access')` from the `FeedbackTrigger` and `FeedbackPanel` rendering conditions |

### Details

**Before:**
```tsx
{hasPermission('feedback.access') && uiSettings?.showFeedbackTrigger !== false && <FeedbackTrigger ... />}
{hasPermission('feedback.access') && uiSettings?.showFeedbackTrigger !== false && <FeedbackPanel />}
```

**After:**
```tsx
{uiSettings?.showFeedbackTrigger !== false && <FeedbackTrigger ... />}
{uiSettings?.showFeedbackTrigger !== false && <FeedbackPanel />}
```

The admin UI toggle (`showFeedbackTrigger`) remains as the global on/off switch. The `/feedback` page and sidebar link will continue to respect `feedback.access` for the management view.

