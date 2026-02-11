

# Vacancy Age: Remove Red from Urgent Tier

## Problem

The "Urgent" (>60 days) Vacancy Age badge currently uses `destructive` (red). The user wants to avoid red entirely across the Positions module since vacancy age is informational, not an error state.

## Proposed Color Scheme

| Days | Current | Proposed |
|------|---------|----------|
| >60 | `destructive` (red) | `outline` + deep orange/rose tint -- signals high priority without "error" connotation |
| >30 | `outline` + amber | Keep as-is (already updated) |
| <=30 | `outline` + emerald | Keep as-is (already updated) |
| null | `secondary` + dash | Keep as-is |

### Why orange instead of red?

- Orange communicates "high priority / needs action" without the "broken / error" meaning of red
- It creates a smooth visual gradient: green (on track) -> amber (attention) -> orange (urgent)
- Maintains clear visual hierarchy while keeping the tone informational

## Changes

### File: `src/config/requisitionColumns.tsx` (line 20)

Change the >60 days badge from `destructive` to an orange outline style:

```tsx
if (days > 60)
  return {
    variant: 'outline' as const,
    label: `${days}d - Urgent`,
    className: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400'
  };
```

### File: `src/pages/positions/RequisitionsTab.tsx` (line 77)

Same change for the duplicate `getVacancyBadge` function:

```tsx
if (days > 60)
  return {
    variant: "outline" as const,
    label: `${days}d - Urgent`,
    className: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400"
  };
```

## Final color gradient

- **On Track** (<=30d): Green/emerald -- everything is fine
- **Attention** (31-60d): Amber/yellow -- starting to take long
- **Urgent** (>60d): Orange -- needs priority action

## What stays the same

- All badge structure, sorting, filtering logic
- Active FTE blue color (already updated)
- Comment counts and other columns

