

# Standardize Font Styling Across Volume Settings and NP Settings

## Problem
Several cells in the Volume Settings and NP Settings tables use inconsistent font sizes, weights, and colors compared to the app's standard cell pattern.

## App Standard (from CellButton / standard cells)
- **Font family**: Inter (global, inherited automatically)
- **Font size**: `text-sm` (14px)
- **Font weight**: `font-normal` for standard text, `font-medium` for Department name
- **Color**: `text-foreground` for primary values, `text-muted-foreground` for placeholders/secondary info

## Changes Needed

### 1. Volume Settings (`src/config/volumeOverrideColumns.tsx`)

| Column | Current | Fix |
|--------|---------|-----|
| Department (line 70) | `px-3 py-2 font-medium` (missing `text-sm`) | Add `text-sm` |

### 2. NP Settings (`src/config/npOverrideColumns.tsx`)

| Column | Current | Fix |
|--------|---------|-----|
| Target NP % (line 48) | `px-3 py-2 text-center` (centered layout) | Change to `flex items-center justify-between w-full h-full px-3` to match the content-left / action-right pattern |
| Target NP % value (line 49) | `text-sm font-medium` | Keep `text-sm font-medium` but ensure `text-foreground` |
| NP Settings Status badges (lines 113, 124, 133, 142) | Hardcoded `bg-yellow-500`, `bg-green-600` | Switch to `variant="outline"` with semantic border/text colors matching Volume Settings pattern (`border-amber-500 text-amber-600`, `border-primary text-primary`, `border-accent text-accent-foreground`) |

### 3. NP Status Badges Alignment with Volume Settings

The NP Settings status badges use filled solid colors (`bg-yellow-500`, `bg-green-600`) while Volume Settings uses outlined badges with semantic colors. Aligning NP to match Volume:

| Status | Volume Settings Style | NP Settings Current | Fix |
|--------|----------------------|--------------------|----|
| Not Set | `variant="secondary"` | `variant="secondary"` | Already matches |
| Expired | `variant="destructive"` | `variant="destructive"` | Already matches |
| Expiring Soon | `variant="outline" border-accent text-accent-foreground` | `bg-yellow-500` (filled) | Change to outline style |
| Active | `variant="outline" border-primary text-primary` | `bg-green-600` (filled) | Change to outline style |

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/volumeOverrideColumns.tsx` | Add `text-sm` to Department cell |
| `src/config/npOverrideColumns.tsx` | Fix Target NP % layout; align status badge styles with Volume Settings |

