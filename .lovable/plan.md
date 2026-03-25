

## Add Training Video Upload for Admin & Labor Team

### Overview
Add an upload dialog to the Training Videos tab, gated by a new `support.upload_video` RBAC permission, allowing authorized users to upload videos with metadata (title, description, optional thumbnail) via `POST /training/upload`.

### Changes

**1. Add RBAC permission — `src/config/rbacConfig.ts`**
- Add `support.upload_video` to `CORE_PERMISSIONS` array
- Add it to `PERMISSION_CATEGORIES.support.permissions`
- Grant it by default to `admin` and `labor_team` roles in `DEFAULT_ROLE_PERMISSIONS`

**2. Create upload hook — `src/hooks/useUploadTrainingVideo.ts`**
- `useMutation` that sends `FormData` (title, description, duration, video file, optional thumbnail) to `POST /training/upload` via `apiFetch`
- On success, invalidate `training-videos` query cache

**3. Create upload dialog — `src/components/support/UploadTrainingVideoDialog.tsx`**
- Dialog with form fields: title (input), description (textarea), video file (drag-drop or browse), optional thumbnail image
- Video file accepts `.mp4,.webm,.mov`; thumbnail accepts `.jpg,.png,.webp`
- Shows file name/size after selection
- Submit button triggers the upload mutation with a loading state

**4. Update TrainingVideosTab — `src/components/support/TrainingVideosTab.tsx`**
- Import `useRBAC` and check `hasPermission('support.upload_video')`
- If permitted, show an "Upload Video" button at the top of the tab
- Button opens the `UploadTrainingVideoDialog`
- Update the video grid to also fetch from `GET /training/uploaded-videos` and merge both sources (legacy GCS + uploaded), or switch entirely to `uploaded-videos` endpoint
- Display `title` (from DB metadata) instead of formatted filename for uploaded videos; show thumbnail if available

**5. Update `useTrainingVideos` hook — `src/hooks/useTrainingVideos.ts`**
- Extend the `TrainingVideo` interface to include optional fields from the upload response: `title`, `description`, `thumbnail_url`, `duration`, `status`, `uploader`
- Fetch from `GET /training/uploaded-videos` (or merge both endpoints) so newly uploaded videos appear in the grid

### Technical Notes
- `apiFetch` already handles `FormData` by omitting `Content-Type` header, so multipart uploads work out of the box
- The upload endpoint extracts `uploaded_by` from the JWT — no need to send user ID from frontend
- Videos with `status: 'processing'` can show a subtle indicator on the card

