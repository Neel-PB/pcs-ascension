

## Fix: Prevent Multiple Tours from Running Simultaneously

### Problem

The `useTour` hook (lines 29-34) auto-starts any tour on first visit if it hasn't been completed. Since `HeaderTour` is always mounted in `AppHeader.tsx` and page-specific tours (StaffingTour, PositionsTour, AdminTour) are mounted on their respective pages, multiple Joyride instances start at the same time -- producing overlapping tooltips as shown in the screenshot.

Additionally, overlay tours like Feedback, AI Hub, and Checklist could also auto-start if their panels are open.

### Fix

Update `useTour.ts` to only auto-start a tour when no other tour is already running. The `activeTour` state in the store isn't set during auto-start, so we need a simple guard.

**File: `src/hooks/useTour.ts`**

1. On auto-start (first visit), check `useTourStore.getState().activeTour` -- if another tour is already active, don't start.
2. When a tour starts running (either auto or triggered), set it as the active tour in the store so other hooks know not to auto-start.
3. For overlay tours (like `header`), skip auto-start entirely -- they should only run when explicitly triggered from the tour sequence or launcher.

**File: `src/stores/useTourStore.ts`**

No changes needed -- the `activeTour` field already exists.

### Implementation Details

**`src/hooks/useTour.ts`** -- Updated auto-start effect:

```typescript
// Auto-start on first visit (only if no other tour is running)
useEffect(() => {
  if (!isCompleted()) {
    const timer = setTimeout(() => {
      const { activeTour } = useTourStore.getState();
      // Don't auto-start if another tour is already running
      if (!activeTour) {
        useTourStore.getState().startTour(pageKey);
        setRun(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [isCompleted, pageKey]);
```

**`src/components/tour/OverlayTour.tsx`** -- Disable auto-start for overlay tours:

The `OverlayTour` component should pass a flag to `useTour` to skip auto-starting. We'll add an `autoStart` option:

```typescript
// useTour.ts - add optional config
export function useTour(pageKey: string, options?: { autoStart?: boolean }) {
  const autoStart = options?.autoStart ?? true;
  
  // Auto-start on first visit
  useEffect(() => {
    if (autoStart && !isCompleted()) {
      const timer = setTimeout(() => {
        const { activeTour } = useTourStore.getState();
        if (!activeTour) {
          useTourStore.getState().startTour(pageKey);
          setRun(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, pageKey, autoStart]);
```

```typescript
// OverlayTour.tsx
const { run, setRun, completeTour } = useTour(tourKey, { autoStart: false });
```

This ensures:
- Only one tour runs at a time
- Page tours (Staffing, Positions, Admin) can still auto-start on first visit
- Overlay tours (Header, Feedback, AI Hub, Checklist) only start when explicitly triggered

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useTour.ts` | Add `autoStart` option; guard auto-start with `activeTour` check |
| `src/components/tour/OverlayTour.tsx` | Pass `{ autoStart: false }` to `useTour` |

