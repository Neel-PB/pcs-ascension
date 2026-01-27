
## Goal
Make it immediately obvious which RBAC view is selected (Matrix / Detail / List) by applying the same “selected route” visual pattern (solid primary background + primary-foreground icon/text). Right now the state is changing, but the selected styling is not visually obvious for you.

## What’s most likely happening
Even though we added `variant="primary"` and a `primary` toggle variant, the selected styling can still appear “not selected” if:
- the “off” state looks too similar to the “on” state (icons remain dark; background looks unchanged), or
- the active styling is being overridden/merged away in a way that makes it visually subtle.

Instead of relying only on Radix’s `data-state` styling, we’ll make the highlight explicitly driven by the React `viewMode` state (the same source of truth that controls the content). This guarantees the highlight always matches what you’re seeing.

## Implementation approach (robust + consistent)
### A) Force highlight based on `viewMode` (guaranteed)
**File:** `src/pages/admin/AccessControlPage.tsx`

1. Create a small helper to compute classes for each view button:
   - Selected: `bg-primary text-primary-foreground shadow-sm`
   - Not selected: `text-muted-foreground hover:text-foreground hover:bg-muted/60`
2. Apply that helper to each `ToggleGroupItem`:
   - `matrix` button uses `viewMode === "matrix"`
   - `detail` button uses `viewMode === "detail"`
   - `list` button uses `viewMode === "list"`
3. Keep the `ToggleGroup` wrapper styling (rounded background), but add a thin border so the segmented control is visible even on very light backgrounds:
   - `className="bg-muted/50 p-0.5 rounded-md border border-border"`

This ensures: even if Radix `data-state` styling fails for any reason, the selected button is still clearly highlighted.

### B) Improve the `primary` Toggle styling so “off vs on” is more readable everywhere
**File:** `src/components/ui/toggle.tsx`

Update the `primary` variant to make “off” state muted by default and “on” state bold/primary:
- Base for primary: `text-muted-foreground`
- On: `data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm`
- Off hover: `data-[state=off]:hover:bg-muted/60 data-[state=off]:hover:text-foreground`
- On hover: `data-[state=on]:hover:bg-primary/90`

This makes the control feel like the selected route style and improves clarity.

### C) Quick verification checklist (what you should see)
After the change:
- When the page loads (default `detail`), the middle icon has a solid primary background and white icon.
- Clicking any icon changes both:
  1) the content area view, and
  2) the highlighted icon (blue background + white icon).

## Files to change
- `src/pages/admin/AccessControlPage.tsx`
  - Add state-driven classes to each `ToggleGroupItem`
  - Slightly enhance ToggleGroup container styling (border)
- `src/components/ui/toggle.tsx`
  - Strengthen `primary` variant: clearer off-state + unmistakable on-state

## Edge cases
- If you’re viewing the published site while changes were only applied in preview, the highlight won’t appear until you publish. As part of testing, we’ll confirm you’re checking the updated build (preview first, then publish when confirmed).

## Acceptance criteria
- You can tell which RBAC view is active without clicking anything.
- The highlight always matches the actual view being displayed.
- Styling matches the “selected route” look (primary background + primary-foreground icon/text).
