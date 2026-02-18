

## Fix: Scroll disappears after tour finishes/skips

### Root Cause
React Joyride sets `overflow: hidden` on `document.body` during the tour to prevent background scrolling. When the tour ends, Joyride should restore the original overflow -- but it sometimes fails to clean up, leaving `overflow: hidden` on the body. Since the shell layout relies on the `main` element for scrolling (which inherits from body overflow), this breaks the scroll.

### Solution
Two changes in `src/components/tour/PositionsTour.tsx`:

1. **Add `disableScrolling={false}`** to the Joyride component -- this tells Joyride not to touch `body` overflow at all, matching the pattern used in `StaffingTour` which doesn't have this issue.

2. **Force-reset `document.body.style.overflow`** in the completion handler as a safety net, ensuring the body overflow is always restored to empty (`""`) when the tour finishes or is skipped.

### Technical Detail

In the `handleCallback` completion block, add:
```tsx
document.body.style.overflow = '';
```

On the Joyride component, add:
```tsx
disableScrolling={false}
```

This is a single-file change to `src/components/tour/PositionsTour.tsx`.
