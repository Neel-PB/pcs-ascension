

## Restyle User Guides to Match FAQ Accordion Design + Reorder Row Buttons

### Changes

#### 1. FAQ-style accordion rows for each guide
**File: `src/components/support/UserGuidesTab.tsx`** — lines 255-327

Replace the current plain hover row with the FAQ accordion style:
- `border border-border/60 border-l-[3px] border-l-primary bg-primary/5 rounded-lg`
- Remove the transparent border / hover-border approach

#### 2. Reorder right-side buttons: Reset → Done badge → Steps → Go & Start
**File: `src/components/support/UserGuidesTab.tsx`** — lines 291-326

Current order: `Steps badge | Done badge | Go & Start button | Reset button`

New order (left to right):
1. **Reset** button (always visible, not just when completed — ghost when not completed)
2. **Done** badge (or empty space if not completed)
3. **Steps** badge
4. **Go & Start** button

```text
Current:  [16 steps] [✓ Done] [▶ Go & Start] [↺]
New:      [↺] [✓ Done] [16 steps] [▶ Go & Start]
```

### Files Modified
1. `src/components/support/UserGuidesTab.tsx` — accordion styling + button reorder

