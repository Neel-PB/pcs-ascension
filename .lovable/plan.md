
# Fix Auth Page Content Overflow

## Problem

The auth page content is overflowing because:
1. The body/html have `overflow-hidden` set in `index.css`
2. The auth page uses `min-h-screen` inside a constrained container
3. On smaller viewports, the two-column layout causes content to overflow without ability to scroll

## Solution

Make the auth page container scrollable while keeping the centered layout.

## Changes

**File: `src/pages/AuthPage.tsx`**

Update the outer container to allow scrolling:

```tsx
// Line 83: Change from
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">

// To
<div className="min-h-screen h-screen overflow-auto flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
```

This adds:
- `h-screen` - Sets explicit height to match viewport
- `overflow-auto` - Enables scrolling when content exceeds viewport

## Technical Details

| Property | Purpose |
|----------|---------|
| `h-screen` | Explicit height matching viewport |
| `overflow-auto` | Scroll only when needed |
| `min-h-screen` | Keeps minimum height for centering |

## Testing

1. View auth page on desktop - content should be centered
2. Resize browser to smaller height - page should scroll
3. View on mobile breakpoint - both cards should be visible with scroll
