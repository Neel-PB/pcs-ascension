

## Fix: Audit Log Tour — Smooth ScrollIntoView Overriding Instant Main Reset

### Root Cause
In the `STEP_BEFORE` handler, `scrollIntoView({ behavior: 'smooth' })` is an animated operation that keeps running after `mainEl.scrollTo({ top: 0, behavior: 'instant' })` executes. The smooth animation continues to scroll the outer `<main>` even after the instant reset, pushing tabs out of view — especially on the last step (audit table) which is far down the page.

### Fix (1 file)

**`src/components/tour/AdminTour.tsx`** — line 33

Change the `scrollIntoView` call from `behavior: 'smooth'` to `behavior: 'instant'` so it completes synchronously before the main reset:

```diff
- el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
+ el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
```

This ensures the element is brought into view immediately, the main container is instantly reset to top, and no lingering animation re-scrolls the outer container.

