

## Fix Blank Page on "Full Guided Tour" Click

### Problem
Clicking "Full Guided Tour" from the user menu causes a completely white/blank page. The app has no Error Boundary, so any unhandled rendering error crashes the entire React tree silently (no sidebar, no header, nothing).

### Root Cause
When `startFullTour()` is called while already on `/staffing`:
1. It resets all tour localStorage flags and sets `activeTour: 'staffing'`
2. Then navigates to `/staffing?tab=summary&tour=true` (same page)
3. Both `StaffingSummary` and `useTour` hook race to consume/delete search params (`tab` and `tour`)
4. The `StaffingSummary` useEffect with empty deps `[]` deletes `tab` immediately, but on a "same-page" navigation React may not remount the component — so the effect doesn't re-fire and the tab state can become stale
5. Meanwhile Joyride tries to target DOM elements that may not be rendered yet

### Fix (2 changes)

#### 1. Add a global Error Boundary (`src/components/ErrorBoundary.tsx`)
Wrap the app so crashes show a recovery UI instead of a blank page. Includes a "Reload" button.

#### 2. Fix the "Full Guided Tour" navigation in `AppHeader.tsx`
When the user is already on `/staffing`, don't navigate — just call `startFullTour()` and let the tour hook handle it. When on a different page, navigate with params.

**Before (line 161-163):**
```tsx
startFullTour();
navigate('/staffing?tab=summary&tour=true');
```

**After:**
```tsx
startFullTour();
if (location.pathname === '/staffing') {
  // Already on staffing — just trigger the tour after a short delay
  setTimeout(() => {
    useTourStore.getState().startTour('staffing');
  }, 300);
} else {
  navigate('/staffing?tab=summary&tour=true');
}
```

### Files
1. **New**: `src/components/ErrorBoundary.tsx` — React class component error boundary with reload button
2. **Edit**: `src/App.tsx` — Wrap `<AppContent />` with `<ErrorBoundary>`
3. **Edit**: `src/components/shell/AppHeader.tsx` (lines 161-163) — Conditional navigation for full tour

