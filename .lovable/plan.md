

# Align Calendar and Date Picker to Helix Design System

## Helix Spec Summary (from the specs page)

| Property | Helix Value | Current Value |
|----------|------------|---------------|
| Day cell size | 40x40px | 36x36px (`h-9 w-9`) |
| Nav buttons | 40x40px, Primary.Main color | 28x28px (`h-7 w-7`), outline + opacity |
| Today marker | 1px border stroke (no fill) | `bg-accent` fill |
| Selected day | Primary.Main fill, white text | Correct (`bg-primary text-primary-foreground`) |
| Hovered day | Light primary fill + 1px border | Ghost button default |
| Disabled day | Content.Disabled color | `opacity-50` -- close |
| Calendar padding | L/R 16px, Top 24px, Bottom 8px | `p-3` (12px uniform) |
| Modal elevation | `shadow-md` | None (inherits from popover) |
| Day-of-week headers | Content.Primary | `text-muted-foreground` |

## Files to Edit

### 1. `src/components/ui/calendar.tsx`

Update all DayPicker classNames to match Helix specs:

- **Day cells**: Change from `h-9 w-9` to `h-10 w-10` (40px) for both `cell` and `day`
- **Head cells**: Change from `w-9` to `w-10`, update color from `text-muted-foreground` to `text-foreground` (Content.Primary)
- **Nav buttons**: Increase from `h-7 w-7` to `h-10 w-10` (40px), change from `outline` variant to `ghost` with `text-primary` color, remove opacity
- **Today styling**: Replace `bg-accent text-accent-foreground` with border-only: `border border-border` (1px inside stroke, no background fill)
- **Hover styling**: Add `hover:bg-primary/10 hover:border hover:border-border` on day cells
- **Calendar padding**: Change from `p-3` to `px-4 pt-6 pb-2` (L/R 16px, Top 24px, Bottom 8px)
- **Row spacing**: Adjust `mt-2` to `mt-1` for tighter day grid

### 2. `src/components/editable-table/cells/EditableDateCell.tsx`

- Update PopoverContent to include `shadow-md` for modal elevation per Helix spec
- Update the internal Calendar className from `p-3` to match the new default padding

### 3. `src/components/editable-table/cells/EditableFTECell.tsx`

- Same PopoverContent shadow update for consistency

## Technical Details

The Calendar component uses `react-day-picker` v8 with shadcn classNames mapping. All changes are CSS-only through the `classNames` prop -- no structural changes needed.

The key visual differences users will notice:
- Slightly larger day cells (40px vs 36px) for better touch targets
- Navigation arrows in brand blue instead of muted outline buttons
- Today's date shown with a subtle border ring instead of a filled background
- Day-of-week headers in primary text color instead of muted
- More breathing room at top, tighter at bottom

