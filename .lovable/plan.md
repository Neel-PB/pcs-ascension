

## Tour Tooltip Redesign: Compact, Wide, and Beautiful

### Problems Identified

1. **Table tour steps appear below the table** -- tooltip should always be positioned above tables so the guide doesn't get hidden or push content down.
2. **Tooltips are too tall** -- excessive vertical padding and spacing waste screen space.
3. **Design needs polish** -- the current tooltip is functional but plain; needs a more refined, modern look.

### Changes

---

### 1. Force `placement: 'top'` on all table-targeting steps

**Files:** `src/components/tour/tourSteps.ts`, `src/components/tour/positionsTourSteps.ts`

Update every step that targets a table element to use `placement: 'top'` instead of `'bottom'` or `'auto'`:

- `tourSteps.ts`:
  - `planning-table` (line 750): already `'top'` -- keep
  - `variance-table` (line 225): already `'top'` -- keep
  - `volume-settings-table` steps (lines 291, 300, 310): change `'auto'` to `'top'`
  - `np-settings-table` steps (lines 345, 353, 363): change `'auto'` to `'top'`
  - `admin-users-table` (line 494): already `'top'` -- keep
  - `admin-rbac-content` (line 563): already `'top'` -- keep
  - `admin-audit-table` (line 587): change `'auto'` to `'top'`
  - `forecast-table-body` (line 268): already `'top'` -- keep
  - `feedback-table` (line 684): already `'top'` -- keep
  - `checklist-table` (line 408): already `'top'` -- keep

- `positionsTourSteps.ts`:
  - `positions-table` (lines 48, 114, 180): already `'top'` -- keep

---

### 2. Compact the TourTooltip (reduce height, increase width)

**File:** `src/components/tour/TourTooltip.tsx`

Spacing reductions:
- Progress bar: keep `h-[3px]` (already minimal)
- CardHeader: reduce `pt-4` to `pt-3`, keep `pb-2`
- CardContent: reduce `pb-3 space-y-3` to `pb-2 space-y-2`
- CardFooter: reduce `pb-4` to `pb-3`
- Section badge padding: reduce from `px-3 py-1` to `px-2.5 py-0.5`

Width increases:
- Default (non-wide): increase from `max-w-[420px] min-w-[340px]` to `max-w-[480px] min-w-[380px]`
- Wide (KPI steps): keep `max-w-[560px] min-w-[480px]`

---

### 3. Beautify the TourTooltip design

**File:** `src/components/tour/TourTooltip.tsx`

Visual enhancements:
- Replace the flat `border-t-2 border-t-primary` with a **gradient accent bar** at the top using a small div with `bg-gradient-to-r from-primary via-primary/80 to-primary/50 h-[3px]`
- Merge the progress bar and accent bar into one element: the gradient bar width animates based on progress
- Add a subtle **glassmorphic** feel: `backdrop-blur-sm bg-card/95` instead of solid `bg-card`
- Improve shadow: use `shadow-xl shadow-black/10 dark:shadow-black/30` for a softer, more elevated look
- Step counter badge: wrap in a `rounded-full bg-muted px-2 py-0.5` pill for a cleaner look
- Primary (Next) button: add `rounded-lg` and subtle shadow `shadow-sm`
- Back button: add `rounded-lg`
- Skip buttons: slightly more prominent with `hover:bg-muted` background transition
- Footer separator: add a subtle `border-t border-border/30` above the footer

---

### 4. Compact the KPICompactPreview

**File:** `src/components/tour/TourDemoPreview.tsx`

- Reduce chart SVG height from `h-14` to `h-12`
- Reduce stats row text sizes
- Tighten grid gap from `gap-2` to `gap-1.5`
- Reduce overall `mt-2` to `mt-1.5`

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourTooltip.tsx` | Compact spacing, wider default, gradient accent bar, glassmorphic card, polished buttons |
| `src/components/tour/tourSteps.ts` | Change table-targeting steps to `placement: 'top'` |
| `src/components/tour/positionsTourSteps.ts` | Verify table steps use `placement: 'top'` (already correct) |
| `src/components/tour/TourDemoPreview.tsx` | Tighter KPICompactPreview spacing |

