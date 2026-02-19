

## Fix: Comments Tour Step - Controlled Step Advancement

### Root Cause (Confirmed via Browser Testing)

Joyride finds the Comments element and fires `STEP_BEFORE` (no "Target not visible" warning in console). However, the tooltip is positioned based on `getBoundingClientRect()` which returns off-screen coordinates because the browser hasn't repainted after the pre-scroll. The tooltip renders but is positioned outside the viewport.

The `STEP_AFTER` pre-scroll runs synchronously, but Joyride immediately advances to the next step in the same event loop tick, before the browser has a chance to complete the scroll and repaint.

### Solution

Switch the Joyride instance to **controlled mode** using a `stepIndex` state. This lets us intercept the step advancement and add a delay when transitioning to a header target step (like Comments), giving the scroll time to settle before Joyride measures the element position.

### Changes

**File: `src/components/tour/PositionsTour.tsx`**

1. Add a `stepIndex` state variable (initialized to 0)
2. Pass `stepIndex` prop to Joyride (enables controlled mode)
3. In the `STEP_AFTER` handler:
   - Check if the next step targets a header element
   - If yes: scroll the table, then use `setTimeout(100ms)` before advancing `stepIndex`
   - If no: advance `stepIndex` immediately
4. Handle `ACTIONS.PREV` (Back button) by decrementing `stepIndex`
5. Handle `ACTIONS.CLOSE` / `ACTIONS.SKIP` for skip/close behavior
6. Reset `stepIndex` to 0 when the tour starts (when `run` changes to true)

### Technical Details

```text
// New state
const [stepIndex, setStepIndex] = useState(0);

// Reset when tour starts
useEffect(() => {
  if (run) setStepIndex(0);
}, [run]);

// In handleCallback, STEP_AFTER handler:
if (type === EVENTS.STEP_AFTER) {
  const nextIndex = index + 1;
  
  if (action === ACTIONS.PREV) {
    setStepIndex(Math.max(0, index - 1));
    return;
  }
  
  if (nextIndex < steps.length) {
    const nextTarget = steps[nextIndex].target as string;
    if (tableHeaderTargets.includes(nextTarget)) {
      // Pre-scroll, then delay advancement
      const nextEl = document.querySelector(nextTarget);
      // ... scroll logic ...
      setTimeout(() => setStepIndex(nextIndex), 150);
    } else {
      setStepIndex(nextIndex);
    }
  }
}

// Pass to Joyride:
<Joyride stepIndex={stepIndex} ... />
```

The key difference from the current approach: in controlled mode, Joyride does NOT auto-advance the index. We explicitly set it after a delay, ensuring the scroll has completed and the browser has repainted before Joyride measures the element's position.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Switch to controlled mode with stepIndex state; add delayed advancement for header target steps |

