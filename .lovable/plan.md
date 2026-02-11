

# Fix Toast/Snackbar Styling to Match Helix Spec

## What's Wrong

The current toast uses a **white background** (`bg-background`) with default Sonner styling. The Helix Snackbar spec shows a distinctly different design:

| Property | Helix Spec (from PDF) | Current Implementation |
|----------|----------------------|----------------------|
| Background | Light green/mint tinted container | White (`bg-background`) |
| Lead icon | Green checkmark circle on the left | Sonner default (small, inconsistent) |
| Layout | Icon + Title/Secondary Text + ACTION button + X | Just text + X |
| Action button | Outlined/bordered text button labeled "ACTION" | Solid primary fill |
| Close button (X) | Always visible, right-aligned, 4px gap from action | Visible but default Sonner positioning |
| Padding | 12px all sides | Default Sonner padding |
| Progress bar | Pink/magenta bar at bottom showing countdown | None |
| Corner radius | Rounded (consistent with cards) | Already `rounded-xl` -- correct |

## Plan

### 1. `src/components/ui/sonner.tsx` -- Restyle to match Helix

Update the Sonner Toaster classNames to match the Helix visual spec:

- **Success variant background**: Light green/mint tint (`bg-emerald-50 dark:bg-emerald-950/30`) instead of white
- **Error variant background**: Light red tint (`bg-red-50 dark:bg-red-950/30`)
- **Warning variant background**: Light amber tint (`bg-amber-50 dark:bg-amber-950/30`)
- **Default/info background**: Keep current `bg-background`
- **Padding**: Set to `p-3` (12px) matching the 12px spec
- **Action button**: Change from solid primary fill to outlined style (`border border-foreground/20 bg-transparent text-foreground`)
- **Close button**: Already visible (opacity-100), ensure proper spacing
- **Title**: Bold weight (`font-semibold`)
- **Description**: Muted color, smaller text

### 2. `src/index.css` -- Add Sonner variant background overrides

Since Sonner applies variant-specific attributes (`data-type="success"`, `data-type="error"`, etc.), add CSS rules to target these for the correct background colors:

```css
/* Helix Snackbar variant backgrounds */
[data-sonner-toast][data-type="success"] {
  background-color: #ecfdf5 !important; /* emerald-50 */
}
[data-sonner-toast][data-type="error"] {
  background-color: #fef2f2 !important; /* red-50 */
}
[data-sonner-toast][data-type="warning"] {
  background-color: #fffbeb !important; /* amber-50 */
}

/* Dark mode variants */
.dark [data-sonner-toast][data-type="success"] {
  background-color: rgba(6, 78, 59, 0.3) !important;
}
.dark [data-sonner-toast][data-type="error"] {
  background-color: rgba(127, 29, 29, 0.3) !important;
}
.dark [data-sonner-toast][data-type="warning"] {
  background-color: rgba(120, 53, 15, 0.3) !important;
}
```

### 3. No other file changes needed

The existing toast calls already use `toast.success()`, `toast.error()`, etc. which will automatically pick up the new variant styles. Position, duration, close button, and animation timing from the previous update are already correct.

## What Users Will See After This Change

- **Success toasts**: Light green/mint background with green checkmark icon
- **Error toasts**: Light red/pink background with red error icon
- **Warning toasts**: Light amber/yellow background with warning icon
- **All toasts**: Outlined action button style, 12px padding, visible close button, bottom-center position, 2.5s auto-dismiss

