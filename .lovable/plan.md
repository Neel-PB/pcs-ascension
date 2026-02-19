

## Fix: Simplify PositionsTour — Remove Controlled Mode

### Root Cause

The PositionsTour was switched to "controlled mode" (manual `stepIndex` state) to fix a Comments tooltip positioning issue. But this introduced multiple cascading bugs:
- Tour doesn't start (controlled mode requires exact stepIndex management)
- Skip/Close don't work (need manual ACTIONS handling)
- Last step gets stuck (need manual finish handling)
- "Tour This Page" fails (state sync issues between stepIndex and run)

Meanwhile, the StaffingTour works perfectly using the **simple uncontrolled** pattern — no stepIndex, no manual action handling.

### Solution

Strip out all controlled mode complexity and match the StaffingTour pattern exactly. Keep only the `STEP_BEFORE` scroll logic for table cells and headers (which works independently of controlled mode).

For the Comments step positioning (the original reason for controlled mode), use a simpler approach: add a `scrollToFirstStep={false}` + dispatch resize events after scrolling in `STEP_BEFORE`, which is already in the code and works without controlled mode.

### Changes

**File: `src/components/tour/PositionsTour.tsx`**

1. Remove `stepIndex` state and its reset `useEffect`
2. Remove `stepIndex` prop from Joyride (switches back to uncontrolled mode)
3. Remove all `EVENTS.STEP_AFTER` / `ACTIONS` handling (Joyride handles this automatically)
4. Keep `EVENTS.STEP_BEFORE` scroll logic (for Active FTE, Shift, Comments targets)
5. Keep `STATUS.FINISHED` / `STATUS.SKIPPED` handling (for completion and section flow)
6. Match StaffingTour props: remove `disableScrolling`, add `disableScrollParentFix`

The resulting component will be ~100 lines shorter and follow the same proven pattern as StaffingTour.

### Simplified handleCallback

```text
const handleCallback = (data: CallBackProps) => {
  const { status, type, step } = data;

  // Pre-scroll table cells/headers into view before step renders
  if (type === EVENTS.STEP_BEFORE && step?.target) {
    // ... existing scroll logic (unchanged) ...
  }

  // Completion handling (same as StaffingTour)
  if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
    document.body.style.overflow = '';
    completeTour();
    // ... reset scroll + section flow logic (unchanged) ...
  }
};
```

### What Gets Removed

- `useState(0)` for stepIndex
- `useEffect` that resets stepIndex
- Entire `EVENTS.STEP_AFTER` block (ACTIONS.PREV, SKIP, CLOSE, last-step handling)
- `stepIndex={stepIndex}` prop on Joyride

### What Stays

- `STEP_BEFORE` scroll logic for table cells and headers
- `STATUS.FINISHED` / `STATUS.SKIPPED` completion + section flow
- `scrollToTarget` helper function
- `tableCellTargets` and `tableHeaderTargets` arrays

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Remove controlled mode; simplify to match StaffingTour pattern |

