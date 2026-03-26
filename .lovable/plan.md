

## Make Training Video Cards More Compact

### Changes

**File: `src/components/support/TrainingVideosTab.tsx`**

1. **Reduce text section padding and spacing**: `p-3 space-y-1` → `px-3 py-2 space-y-0.5` for a tighter bottom section
2. **Reduce text sizes**: Title from `text-sm` → `text-xs`, description/uploader already `text-xs` — keep as-is
3. **Align fallback emblem to bottom-center**: Change the fallback `<img>` container from centered (`flex items-center justify-center`) to bottom-aligned (`flex items-end justify-center pb-2`), and for actual thumbnails use `object-bottom` so the image anchors to the bottom

