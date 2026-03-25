

## Integrate Signed URL Refresh for Training Video Playback

### Problem
Currently, when a user clicks a video card, the player uses the `url` stored on the video object (which may be an expired signed URL). The new `GET /training/videos/:id/url` endpoint provides fresh signed URLs on demand.

### Changes

**1. `src/components/support/TrainingVideosTab.tsx`**
- When a video card is clicked, instead of immediately setting the video URL, fetch a fresh signed URL via `apiFetch(`/training/videos/${video.id}/url`)` before opening the player dialog.
- Add a loading state while the fresh URL is being fetched.
- On success, set the active video with the refreshed `videoUrl` and `thumbnailUrl`.
- On error (e.g. legacy videos without DB records), fall back to the existing `video.url`.

**2. No hook file needed** — the fetch is a one-off call triggered on click, not a persistent query. A simple async function inside the component is sufficient.

### Flow
1. User clicks video card → show loading indicator on the card or dialog
2. Call `GET /training/videos/${id}/url`
3. If success → open player with fresh `videoUrl`
4. If 404 (legacy video) → fall back to `video.url`
5. Player dialog renders with the resolved URL

