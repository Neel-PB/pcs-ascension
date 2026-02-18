

## Fix: Joyride leaves `overflow: initial` on scroll containers after tour ends

### Root Cause
This is a known React Joyride bug (GitHub issue #563). During the tour, Joyride automatically detects scroll parent elements and injects `overflow: initial` as an inline style on them to ensure the spotlight is visible. When the tour finishes, Joyride sometimes fails to remove this inline style. This overrides the table container's `overflow-x-auto` class, causing the horizontal scrollbar to disappear permanently.

The previous fixes (resetting body overflow, delaying scroll resets) didn't address this because the problem isn't about scroll position -- it's about Joyride corrupting the `overflow` CSS property on the table's scroll container element itself.

### Solution

**File: `src/components/tour/PositionsTour.tsx`**

Two changes:

1. Add `disableScrollParentFix={true}` to the Joyride component. This prevents Joyride from touching the `overflow` property on any scroll parent elements. Since we already handle scrolling manually in the callback, this is safe and eliminates the root cause.

2. As a safety net, in the completion handler, explicitly remove any leftover inline `overflow` styles from the table's scroll container. This handles any edge case where Joyride still manages to inject styles.

### Technical Detail

Add prop to Joyride:
```tsx
<Joyride
  disableScrollParentFix={true}
  // ... existing props
/>
```

In the `resetScroll` function (already called with setTimeout), add cleanup:
```tsx
const resetScroll = () => {
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' });
  const tableContainer = document.querySelector('[class*="overflow-x-auto"]');
  if (tableContainer) {
    tableContainer.scrollTo({ left: 0, behavior: 'instant' });
    // Remove any inline overflow styles left by Joyride
    (tableContainer as HTMLElement).style.overflow = '';
  }
};
```

This is a single-file change to `src/components/tour/PositionsTour.tsx`.

