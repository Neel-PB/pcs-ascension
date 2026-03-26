

## Compact Training Video Cards with Default Thumbnail

### Changes

**File: `src/components/support/TrainingVideosTab.tsx`**

1. **Reduce thumbnail height**: `h-48` → `h-32` for a more compact card
2. **Show default thumbnail when none exists**: Import `AscensionEmblem` (the logo SVG used across the app) and render it as a centered fallback when `thumbnail_url` is missing — a muted background with the logo centered, similar to the branded feel on the login page
3. **Reduce text padding**: `p-4` → `p-3` and `space-y-2` → `space-y-1` on the text container
4. **Single-line title**: `line-clamp-2` → `line-clamp-1` on the title
5. **Single-line description**: `line-clamp-2` → `line-clamp-1` on description

This keeps the card as compact as possible while still showing all relevant info.

