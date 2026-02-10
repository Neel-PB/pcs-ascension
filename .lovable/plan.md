

# Fix KPI Card Layout Shift on Click

## Problem

When clicking a Shortage or Surplus card, the border changes from the default `border` (1px) to `border-2` (2px). This 1px difference causes the card content to shift slightly, creating a visible flicker.

## Fix

**File:** `src/components/forecast/ForecastKPICards.tsx`

Always apply `border-2` on both active and inactive states so the card dimensions never change -- only the border color/opacity and background change:

**Shortage card (lines 37-40):**
```tsx
activeFilter === 'shortage'
  ? "border-2 border-destructive/60 bg-destructive/10 shadow-sm"
  : "border-2 border-destructive/30 bg-destructive/5"
```

**Surplus card (lines 68-71):**
```tsx
activeFilter === 'surplus'
  ? "border-2 border-primary/60 bg-primary/10 shadow-sm"
  : "border-2 border-primary/30 bg-primary/5"
```

The only difference: add `border-2` to the inactive (else) branch so border width is constant. This eliminates the 1px jump entirely.

