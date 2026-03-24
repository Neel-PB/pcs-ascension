

# Fix Feed API Route Mismatch

## Problem
The frontend calls `/feed/posts` but the NestJS backend registered routes under `/feed` (no `/posts` suffix).

Backend routes:
- `GET /feed` (not `/feed/posts`)
- `POST /feed` (not `/feed/posts`)
- `PATCH /feed/:id`
- `DELETE /feed/:id`
- `POST /feed/:id/like`
- `DELETE /feed/:id/like` (unlike is DELETE, not POST with toggle)
- `POST /feed/:id/comments`
- `POST /feed/upload`

## Changes

### `src/hooks/useEmployeeFeed.ts`
- Change all `/feed/posts` references to `/feed`
- `useEmployeeFeed()`: `GET /feed`
- `useCreatePost()`: `POST /feed`
- `useEditPost()`: `PATCH /feed/:id`
- `useDeletePost()`: `DELETE /feed/:id`
- `useLikePost()`: `POST /feed/:id/like` for like, `DELETE /feed/:id/like` for unlike
- `useAddComment()`: `POST /feed/:id/comments` (already correct suffix)
- `uploadFeedAttachment()`: `POST /feed/upload` (already correct)

Only one file needs updating.

