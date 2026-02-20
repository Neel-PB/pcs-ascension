

## Add Skip Button to Single-Section Tours

### Problem

When a user launches "Tour This Page" from the user menu and it was accidental, there is no way to dismiss it — the skip buttons are only shown during the full guided tour (`singleSection === false`).

### Solution

Show a "Skip" button in the `TourTooltip` footer when `singleSection` is `true`. This gives users an escape hatch for any accidentally launched tour.

### File to Change

| File | Change |
|------|--------|
| `src/components/tour/TourTooltip.tsx` | On line 92, update the conditional so that when `singleSection` is true, a single "Skip" button is rendered (using `handleSkipAll`). When `singleSection` is false, the existing "Skip All" and "Skip Section" buttons continue to show as before. |

### Updated Footer Logic (lines 91-114)

```text
<div className="flex items-center gap-1">
  if singleSection:
    Show a "Skip" button that calls handleSkipAll
  else:
    Show "Skip All" button (existing)
    Show "Skip Section" button if not last section (existing)
</div>
```

This is a one-line conditional addition — no other files or logic need to change.

