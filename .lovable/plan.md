

## Improve Joyride Tour Appearance and Fix Active FTE / Shift Highlighting

### Problem 1: Active FTE and Shift Cells Not Highlighting

The `data-tour="positions-shift-cell"` wrapper still uses `className="w-full h-full"` which gives Joyride no measurable height (since `h-full` resolves to 0 if the parent has no explicit height). The Active FTE wrapper was fixed previously but the shift was missed. Additionally, Joyride with `disableScrollParentFix` struggles to calculate spotlight coordinates for elements inside horizontally scrollable containers -- a small delay is needed between scrolling the element into view and letting Joyride measure it.

**Fix in `EmployeesTab.tsx` and `ContractorsTab.tsx`:**
- Change the shift cell wrapper from `className="w-full h-full"` to `className="w-full min-h-[48px] flex items-center"` (same as the active-fte fix)

**Fix in `PositionsTour.tsx`:**
- Add a forced Joyride re-render after `scrollIntoView` by dispatching a resize event after a short delay -- this forces Joyride to recalculate the spotlight position after the scroll has settled
- Remove `disableScrollParentFix` -- this prop prevents Joyride from adjusting for scroll parents, causing incorrect spotlight positions for cells deep inside scrollable tables

### Problem 2: Improve Joyride Visual Appearance

The current tour tooltip looks plain compared to the rich demo previews inside it. Improvements to `TourTooltip.tsx`:

1. **Progress bar** instead of plain "X of Y" text -- a thin accent-colored progress bar at the top of the card showing completion
2. **Step dots** alongside the text counter for visual progress tracking
3. **Subtle header accent** -- a thin primary-colored top border on the card for brand consistency
4. **Improved button styling** -- the Skip button gets a more subtle treatment, Next/Back get slightly more contrast
5. **Better card shadow** -- upgrade from `shadow-xl` to a more layered shadow with a subtle primary glow
6. **Spotlight glow** -- add a subtle box-shadow ring around the spotlight cutout for better visibility

### Technical Details

**`src/components/tour/TourTooltip.tsx` changes:**

```
Card updates:
- Add border-t-2 border-primary for accent stripe at top
- Replace shadow-xl with shadow-2xl shadow-primary/5 for subtle glow
- Add a progress bar below the header: thin div with width based on (index+1)/size
- Add step indicator dots in the footer alongside counter text

Button updates:
- Skip: smaller, more ghost-like with hover:text-foreground
- Back: keep outline but add hover transition
- Next/Finish: keep primary, add slight scale on hover
```

**`src/components/tour/PositionsTour.tsx` changes:**

```typescript
// Remove disableScrollParentFix
// In STEP_BEFORE, after scrollIntoView, force recalc:
if (el) {
  el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
  // Force Joyride to recalculate after scroll settles
  setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
}

// Add spotlightPadding via spotlight styles
spotlight: {
  borderRadius: 12,
  padding: 6,
  boxShadow: '0 0 0 2px hsl(var(--primary) / 0.3), 0 0 15px 4px hsl(var(--primary) / 0.1)',
}
```

**`src/pages/positions/EmployeesTab.tsx` and `ContractorsTab.tsx`:**

```typescript
// Shift cell wrapper -- change h-full to min-h-[48px] flex items-center
return row.id === firstRowId 
  ? <div data-tour="positions-shift-cell" className="w-full min-h-[48px] flex items-center">{cell}</div> 
  : cell;
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourTooltip.tsx` | Add progress bar, accent stripe, step dots, improved shadows and button styling |
| `src/components/tour/PositionsTour.tsx` | Remove `disableScrollParentFix`, add resize dispatch for recalc, add spotlight glow |
| `src/components/tour/StaffingTour.tsx` | Add matching spotlight glow styles for consistency |
| `src/components/tour/OverlayTour.tsx` | Add matching spotlight glow styles for consistency |
| `src/pages/positions/EmployeesTab.tsx` | Fix shift cell wrapper: `h-full` to `min-h-[48px] flex items-center` |
| `src/pages/positions/ContractorsTab.tsx` | Fix shift cell wrapper: `h-full` to `min-h-[48px] flex items-center` |

