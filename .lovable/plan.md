

# Fix Screenshot Capture Fidelity

## Problem
`html2canvas` re-renders the DOM to a canvas element, which doesn't faithfully reproduce modern CSS (Tailwind utilities, backdrop-blur, shadows, custom fonts, etc.). This is why the captured screenshot looks visually different from the actual UI — it's a fundamental limitation of the library.

## Solution
Replace `html2canvas` with **`html-to-image`**, which uses SVG `foreignObject` rendering. This approach lets the browser's own rendering engine produce the image, resulting in pixel-perfect output that matches what's on screen.

## Changes

### 1. Install `html-to-image`
Add dependency: `html-to-image` (remove `html2canvas`).

### 2. `src/lib/capturePageScreenshot.ts` — Rewrite with html-to-image
- Replace `html2canvas` import with `import { toBlob } from 'html-to-image'`
- Use `toBlob(document.body, { filter, backgroundColor, pixelRatio })` to capture the full page
- The `filter` callback excludes elements with `[data-feedback-ui]` (same as current `ignoreElements`)
- For area cropping: capture full page as a blob, draw it onto a temporary canvas, then crop the selected region using the same scroll-offset math already in place
- `pixelRatio` set to `window.devicePixelRatio` for sharp output

### 3. No changes to other files
`ScreenshotSelectionOverlay`, `FeedbackTrigger`, and `ScreenshotCapture` all remain unchanged — they only depend on `capturePageScreenshot` returning a `Blob | null`.

## Files Modified
- `package.json` (swap dependency)
- `src/lib/capturePageScreenshot.ts` (rewrite)

