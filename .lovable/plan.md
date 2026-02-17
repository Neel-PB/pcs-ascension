

## Fix: Admin Tabs Unreachable After Tour — Scroll Reset Not Working

### Root Cause
Two issues prevent the scroll reset from working:

1. **Joyride's `scrollToFirstStep` prop** triggers its own native scroll on ancestor containers (including the outer `<main>`), which we cannot control. This races with the manual `scrollTo` reset.
2. **`behavior: 'smooth'` is asynchronous** — the scroll commands fire but don't complete before `completeTour()` unmounts Joyride and potentially interrupts the scroll animation.

### Fix (1 file)

#### `src/components/tour/AdminTour.tsx`

**Change 1 — Disable Joyride's built-in scrolling (line 60):**
Remove `scrollToFirstStep` (or set it to `false`) since the manual `STEP_BEFORE` handler already handles element scrolling. This prevents Joyride from independently scrolling the outer `<main>`.

**Change 2 — Use `behavior: 'instant'` on completion (lines 43, 47):**
Replace `'smooth'` with `'instant'` in the `STATUS.FINISHED`/`STATUS.SKIPPED` block so the scroll reset happens synchronously before `completeTour()` unmounts the component.

```typescript
if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
    mainContainer.scrollTo({ top: 0, behavior: 'instant' });
  }
  const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
  }
  completeTour();
}
```

**Change 3 — Also use `'instant'` for the main reset during steps (line 36):**
Keep the outer main pinned at top instantly rather than racing with smooth scroll.

```typescript
mainEl.scrollTo({ top: 0, behavior: 'instant' });
```

**Change 4 — Remove `scrollToFirstStep` from Joyride props (line 60):**
Delete or set to `false`:
```diff
-      scrollToFirstStep
+      scrollToFirstStep={false}
```

These changes ensure scroll resets complete synchronously and Joyride doesn't fight the manual scroll logic.

