

## Remove File Size from Training Videos

### Change
In `src/components/support/TrainingVideosTab.tsx`, remove the `formatFileSize` call from the video card metadata line (around line 131). Keep the uploader name if present.

**Before:**
```tsx
<p className="text-xs text-muted-foreground">
  {formatFileSize(video.size)}
  {video.uploader && ` · ${video.uploader.first_name || ""} ${video.uploader.last_name || ""}`.trim()}
</p>
```

**After:**
```tsx
{video.uploader && (
  <p className="text-xs text-muted-foreground">
    {`${video.uploader.first_name || ""} ${video.uploader.last_name || ""}`.trim()}
  </p>
)}
```

Also remove the now-unused `formatFileSize` function (lines 12-15).

Single file change: `src/components/support/TrainingVideosTab.tsx`.

