

## Training Videos Tab UI Tweaks

### Changes

**File: `src/components/support/TrainingVideosTab.tsx`**

1. **Remove video count** (lines 71-81) — Remove the `<span>` showing "3 videos". Keep the Upload button, move it to right-aligned standalone.

2. **Increase thumbnail height** — Change `h-36` → `h-48` on the thumbnail container (line 102) for a taller preview area.

3. **Add spacing between title, description, and uploader** — Change `space-y-1` → `space-y-2` on the text container (line 120), giving more breathing room between the three text elements.

