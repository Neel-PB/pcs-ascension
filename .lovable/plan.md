

# Migrate Feedback Module from Supabase to NestJS

## Summary
Replace all Supabase client calls in the 3 feedback hooks and the screenshot upload function with `apiFetch` calls to the new NestJS endpoints.

## Changes

### 1. `src/lib/apiFetch.ts` — Support FormData uploads
The current implementation always sets `Content-Type: application/json`, which breaks `FormData` uploads. Add a check: if `options.body` is a `FormData` instance, omit the `Content-Type` header (browser sets it automatically with the boundary).

### 2. `src/hooks/useFeedback.ts` — Replace Supabase with apiFetch
- Remove `supabase` import, add `apiFetch` import
- **feedbackQuery**: `apiFetch<Feedback[]>('/feedback')` — backend already returns author profiles and orders by `created_at DESC`
- **createFeedback**: `apiFetch('/feedback', { method: 'POST', body: JSON.stringify(input) })` — no need to pass `user_id`, backend extracts from JWT
- **updatePcsStatus**: `apiFetch(\`/feedback/${id}/pcs-status\`, { method: 'PATCH', body: JSON.stringify({ pcs_status }) })`
- **updatePbStatus**: `apiFetch(\`/feedback/${id}/pb-status\`, { method: 'PATCH', body: ... })`
- **updateFeedbackType**: `apiFetch(\`/feedback/${id}/type\`, { method: 'PATCH', body: ... })`
- **updateFeedbackPriority**: `apiFetch(\`/feedback/${id}/priority\`, { method: 'PATCH', body: ... })`
- **deleteFeedback**: `apiFetch(\`/feedback/${id}\`, { method: 'DELETE' })`
- **uploadScreenshot**: Convert from Supabase storage to `apiFetch('/feedback/upload-screenshot', { method: 'POST', body: formData })` using `FormData` with the blob. Returns `{ url: string }`.

### 3. `src/hooks/useFeedbackComments.ts` — Replace Supabase with apiFetch
- **commentsQuery**: `apiFetch<FeedbackComment[]>(\`/feedback/${feedbackId}/comments\`)` — backend returns author profiles
- **addComment**: `apiFetch(\`/feedback/${feedbackId}/comments\`, { method: 'POST', body: JSON.stringify({ content }) })`
- **deleteComment**: `apiFetch(\`/feedback/${feedbackId}/comments/${commentId}\`, { method: 'DELETE' })`
- Remove `useAuth` import (no longer needed — JWT handles user identity)

### 4. `src/hooks/useFeedbackCommentCounts.ts` — Replace Supabase with apiFetch
- Backend returns `{ "feedback-id-1": 5, ... }` as a plain object
- Convert the response object to a `Map<string, number>` for compatibility with existing consumers

## Files Modified
- `src/lib/apiFetch.ts`
- `src/hooks/useFeedback.ts`
- `src/hooks/useFeedbackComments.ts`
- `src/hooks/useFeedbackCommentCounts.ts`

No UI component changes needed — the hooks maintain the same interface.

