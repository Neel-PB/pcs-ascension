

## Fix: Full Guided Tour Should Work From Any Page

### Problem

When clicking "Full Guided Tour" from the header menu, it only works if you're already on the `/staffing` page. From any other page (e.g., `/support`), nothing happens.

### Root Cause

`startFullTour()` in the tour store sets `activeTour: 'staffing'` but does **not** navigate to `/staffing`. The first tour in the sequence (`staffing`) relies on the `useTour('staffing')` hook running on the Staffing page to detect `activeTour === 'staffing'` and start Joyride. If you're on `/support`, that hook isn't mounted, so nothing happens.

### Fix

**File: `src/components/shell/AppHeader.tsx`**

Instead of calling `startFullTour()` directly, wrap it with navigation to `/staffing?tab=summary&tour=true`:

```
Before:
  <DropdownMenuItem onSelect={() => startFullTour()}>

After:
  <DropdownMenuItem onSelect={() => {
    startFullTour();
    navigate('/staffing?tab=summary&tour=true');
  }}>
```

This ensures the browser navigates to the first tour's page (`/staffing` with `summary` tab), where the `useTour` hook will pick up the active tour and start Joyride. The `?tour=true` param acts as a fallback trigger already supported by the existing `useTour` hook.

### Scope

- Single file change: `src/components/shell/AppHeader.tsx` (line 196)
- No changes to the tour store, tour config, or any tour components
- Works from any page since it explicitly navigates first

