

## Fix: All Admin Tabs Becoming Unusable After Tour Completion

### Root Cause
The Admin page has a **nested scroll structure**:
1. Outer: `ShellLayout` `<main>` element with `overflow-y-scroll`
2. Inner: AdminPage content div with `overflow-y-auto`

During a tour, `scrollIntoView()` on step targets scrolls **both** containers. When the tour finishes, the current fix only scrolls the inner container back to top. The outer `<main>` remains scrolled down, pushing the tab navigation bar out of view and making the entire module unusable.

### Fix (2 changes in 1 file)

#### `src/components/tour/AdminTour.tsx`

**Change 1 — Scroll-to-top on completion (lines 34-40):**
Also scroll the outer `<main>` element back to top:

```typescript
if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
  // Scroll outer shell main container to top
  const mainContainer = document.querySelector('main');
  if (mainContainer) {
    mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Scroll inner content area to top
  const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }
  completeTour();
}
```

**Change 2 — Prevent outer scroll during steps (line 30-32):**
Replace `scrollIntoView` with a scoped scroll that only scrolls within the inner content div, preventing the outer `<main>` from being pushed:

```typescript
if (type === EVENTS.STEP_BEFORE && step?.target) {
  const el = document.querySelector(step.target as string);
  if (el) {
    // Use scrollIntoView but immediately reset outer main to prevent it drifting
    el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
```

This ensures the outer shell container stays pinned at the top throughout the tour and resets properly after completion, keeping the tab navigation always accessible.

