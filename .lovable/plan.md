

# Improve Forecast KPI Card Selection Indicator

## Problem

When clicking the Shortage or Surplus KPI card, the active state uses `ring-2 ring-destructive ring-offset-2`, which creates a thick colored outline with a white gap (ring-offset). This looks heavy and out of place compared to the rest of the app's clean visual style.

## Proposed Design

Replace the ring with a more refined approach: increase the border weight and background intensity on the selected card, giving a subtle "pressed/active" feel without the bulky ring.

**Active Shortage card:**
- Border: `border-2 border-destructive/60` (stronger red border, no ring)
- Background: `bg-destructive/10` (slightly deeper tint)
- Shadow: `shadow-sm` (subtle lift)

**Active Surplus card:**
- Border: `border-2 border-primary/60` (stronger blue border, no ring)
- Background: `bg-primary/10` (slightly deeper tint)
- Shadow: `shadow-sm` (subtle lift)

**Inactive cards** keep their current light styling (`border-destructive/30 bg-destructive/5`).

## Technical Change

**File:** `src/components/forecast/ForecastKPICards.tsx`

**Shortage card (lines 37-40):** Replace ring styling:
```tsx
className={cn(
  "py-2 px-4 cursor-pointer transition-all",
  activeFilter === 'shortage' 
    ? "border-2 border-destructive/60 bg-destructive/10 shadow-sm"
    : "border-destructive/30 bg-destructive/5"
)}
```

**Surplus card (lines 66-69):** Replace ring styling:
```tsx
className={cn(
  "py-2 px-4 cursor-pointer transition-all",
  activeFilter === 'surplus' 
    ? "border-2 border-primary/60 bg-primary/10 shadow-sm"
    : "border-primary/30 bg-primary/5"
)}
```

This produces a cleaner, more polished selection state that fits the app's design language -- visible but not overwhelming.

