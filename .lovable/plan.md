

## Consolidate Toast Notifications to Helix Snackbar Spec

### Problem

The app runs **two separate notification systems** simultaneously:

1. **Sonner** -- used by ~38 files, appears bottom-center, partially styled to Helix spec
2. **Radix/Shadcn Toast** -- used by only **4 files**, appears top-right/bottom-right with completely different styling

This causes inconsistent close button placement, different animation behaviors, and mismatched visual styling. The Helix Snackbar spec requires a single unified look: bottom-center, rounded-xl, close button inline on the right, variant-tinted backgrounds, and standardized animations.

### Plan

**Step 1: Migrate the 4 remaining files from Radix Toast to Sonner**

| File | Change |
|---|---|
| `src/components/ai/PillChatBar.tsx` | Replace `useToast` import with `toast` from `sonner`; convert `toast({ title, description, variant })` calls to `toast("title", { description })` or `toast.error(...)` |
| `src/components/ai/VoiceRecorder.tsx` | Same migration -- replace `useToast` hook with direct `toast` from `sonner` |
| `src/components/profile/AvatarUploadCrop.tsx` | Replace `toast` import from `use-toast` with `toast` from `sonner` |
| `src/hooks/useAvatarUpload.ts` | Replace `toast` import from `use-toast` with `toast` from `sonner` |

**Step 2: Remove the old Radix Toast system from the app**

- Remove the `<Toaster />` (Radix) component from `App.tsx`, keeping only `<Sonner />`
- The following files become dead code and can be deleted:
  - `src/components/ui/toaster.tsx`
  - `src/components/ui/toast.tsx`
  - `src/hooks/use-toast.ts`
  - `src/components/ui/use-toast.ts`

**Step 3: Refine Sonner close button and layout to match Helix spec**

Update `src/components/ui/sonner.tsx` and `src/index.css` to fix:

- **Close button position**: Move it inline within the toast row (right-aligned, not floating/overlapping outside the toast). The Helix spec has the close (X) icon sitting flush on the right side of the snackbar, vertically centered.
- **Close button styling**: Always visible (`opacity-100`), 24px icon size, rounded-full hit area, matching foreground color.
- **Toast layout**: Single horizontal row -- icon (optional) | text content | action button (optional) | close button.
- **Consistent padding**: `px-4 py-3` for compact Helix density.

CSS additions to `src/index.css`:

```css
/* Helix Snackbar close button positioning */
[data-sonner-toast] [data-close-button] {
  position: static !important;
  transform: none !important;
  margin-left: auto;
  border: none !important;
  background: transparent !important;
  opacity: 1 !important;
  color: currentColor;
}
```

### Files Modified (Summary)

| File | Action |
|---|---|
| `src/components/ai/PillChatBar.tsx` | Migrate to Sonner |
| `src/components/ai/VoiceRecorder.tsx` | Migrate to Sonner |
| `src/components/profile/AvatarUploadCrop.tsx` | Migrate to Sonner |
| `src/hooks/useAvatarUpload.ts` | Migrate to Sonner |
| `src/App.tsx` | Remove Radix `<Toaster />` import and usage |
| `src/components/ui/sonner.tsx` | Refine close button and layout classes |
| `src/index.css` | Add close button positioning CSS |
| `src/components/ui/toaster.tsx` | Delete |
| `src/components/ui/toast.tsx` | Delete |
| `src/hooks/use-toast.ts` | Delete |
| `src/components/ui/use-toast.ts` | Delete |

