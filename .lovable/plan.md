

# Fix Feed: Author Name and Attachment Image

## Problems Found

From the actual API response:
```json
{
  "user": { "first_name": "Admin", "last_name": "User", ... },
  "attachments": ["feed/982cd2df-c0b9-4a4a-bd24-25bba450574c.png"]
}
```

1. **"Unknown User"**: The normalizer looks for `post.author` but the API returns `post.user`. Since no `author` key exists, it falls back to `{ first_name: 'Unknown', last_name: 'User' }`.

2. **Broken image**: Attachments are stored as relative paths (e.g. `feed/982cd2df-...png`), not full URLs. The `AttachmentDisplay` component tries to use them as `src` directly, which fails.

## Changes

### 1. `src/hooks/useEmployeeFeed.ts` — Fix author mapping
In `normalizePosts`, check for `post.user` in addition to `post.author`:
```
author: post.author || post.user || { first_name: 'Unknown', ... }
```
Map `avatar_url` from `post.user.avatar_url` or `post.user.avatarUrl`.

### 2. `src/hooks/useEmployeeFeed.ts` — Resolve attachment URLs
Add a helper that converts relative paths to full GCS signed URLs or public URLs. Since the backend already has a `/feed/upload` endpoint that returns URLs, the simplest fix is to have the normalizer prepend the API base URL or a known storage base URL to relative paths:
- If the attachment starts with `http`, use as-is
- Otherwise, construct the full URL (the backend should ideally return full URLs — but as a frontend fix, we can call a resolve function)

**Preferred approach**: Since the backend stores relative paths and generates signed URLs on read (which was the cause of the earlier 500 error), the backend's `GET /feed` response should now return full signed URLs after the IAM fix. If it's still returning relative paths, the frontend will prefix them with the GCS bucket base URL from config or the API base URL.

### 3. `src/components/feed/AttachmentDisplay.tsx` — No changes needed
Once URLs are resolved in the normalizer, this component works as-is.

## Files Modified
- `src/hooks/useEmployeeFeed.ts` — fix `post.user` → `author` mapping + resolve relative attachment paths to full URLs

