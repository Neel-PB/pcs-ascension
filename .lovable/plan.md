

# Migrate Feed from Supabase to NestJS API

## Summary
Replace all direct Supabase client calls in the feed system with NestJS API calls via `apiFetch`, matching the pattern used by staffing, positions, and user management modules.

## Required NestJS API Endpoints

These endpoints need to exist on the backend (`ascension-api`):

```text
GET    /feed/posts              — List posts (with author, likes, comments)
POST   /feed/posts              — Create a post
PATCH  /feed/posts/:id          — Edit a post
DELETE /feed/posts/:id          — Delete a post
POST   /feed/posts/:id/like     — Toggle like on a post
POST   /feed/posts/:id/comments — Add a comment to a post
POST   /feed/upload             — Upload attachment (returns URL)
```

## Frontend Changes

### 1. Rewrite `useEmployeeFeed.ts`
Replace all 6 Supabase-based hooks with `apiFetch` equivalents:
- `useEmployeeFeed()` → `GET /feed/posts` with react-query
- `useCreatePost()` → `POST /feed/posts`
- `useEditPost()` → `PATCH /feed/posts/:id`
- `useDeletePost()` → `DELETE /feed/posts/:id`
- `useLikePost()` → `POST /feed/posts/:id/like`
- `useAddComment()` → `POST /feed/posts/:id/comments`

Handle both flat array and `{ data, total }` response formats per project convention.

### 2. Update `FeedComposer.tsx`
- Replace `supabase.storage.from('post-images').upload()` with `POST /feed/upload` (multipart form or base64 payload)
- Remove `import { supabase }` entirely

### 3. Update `UnifiedEmployeeFeed.tsx`
- Replace `supabase.storage.from('post-images').upload()` with the new upload endpoint
- Replace `supabase.storage.from('avatars').getPublicUrl()` in `resolveAvatarUrl` — either pass full URLs from API or use a utility that builds the URL from config
- Remove `import { supabase }`

### 4. Update `FeedHistory.tsx`
- No direct Supabase calls here (uses hooks only) — no changes needed beyond what the hook rewrite covers

### 5. Update `AttachmentDisplay.tsx`
- No Supabase calls — no changes needed

### 6. Remove Supabase realtime for feed (if any)
- Check `useRealtimeSubscriptions.ts` — currently no feed-specific subscription exists, so no change needed

## Technical Notes
- Auth token injection is handled automatically by `apiFetch` (reads `nestjs_token` from sessionStorage)
- The NestJS backend must join profiles/author data server-side and return it in the response
- File uploads: the backend should accept multipart/form-data and store files (e.g. in GCS or the existing storage), returning the public URL
- Response shape for posts should match the current frontend interface: `{ id, content, post_type, attachments, created_at, author: { first_name, last_name, avatar_url }, likes: string[], comments: [...] }`

## Files Modified
- `src/hooks/useEmployeeFeed.ts` — full rewrite
- `src/components/messaging/FeedComposer.tsx` — replace storage upload
- `src/components/feed/UnifiedEmployeeFeed.tsx` — replace storage upload + avatar URL resolution

## Prerequisites
The NestJS backend endpoints listed above must be implemented first. If they don't exist yet, the frontend migration can be built to target them, but the feed will not function until the backend is ready.

