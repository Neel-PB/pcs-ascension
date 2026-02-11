

# Align Icon Button to Helix Spec

## Helix Icon Button Spec Summary

| Property | Helix Value | Current (`size="icon"`) |
|----------|------------|------------------------|
| Small size | 40x40px | `h-10 w-10` (40px) -- matches |
| Large size | 48x48px | Not available |
| Small padding | 8px | Implicit from size constraint |
| Large padding | 12px | Not available |
| Corner radius | `rounded-full` | `rounded-md` (inherited from base) |
| Icon size | 24x24px | `[&_svg]:size-4` (16px) -- too small |
| Styles | Outlined, Filled, Icon (ghost) | Mapped to `outline`, `default`, `ghost` variants |
| Hover (Filled) | `shadow-sm` | No shadow on hover |
| Disabled | Muted icon + bg | `opacity-50` -- close enough |

## Changes to `src/components/ui/button.tsx`

### 1. Fix icon size override for icon buttons
The base CVA sets `[&_svg]:size-4` (16px) globally. Icon buttons need 24px icons per Helix. Add compound-style overrides in the `icon` and new `icon-lg` sizes.

### 2. Add `icon-lg` size variant
- `icon`: keep at `h-10 w-10` (40px, Small touch area) but add `rounded-full` and `[&_svg]:size-6`
- `icon-lg`: new at `h-12 w-12` (48px, Large touch area) with `rounded-full` and `[&_svg]:size-6`

### 3. Make icon sizes fully round
Both `icon` and `icon-lg` get `rounded-full` to match the Helix "full round corner" spec.

### Resulting size variants:
```
size: {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-4",
  lg: "h-11 px-8",
  icon: "h-10 w-10 rounded-full [&_svg]:size-6",
  "icon-lg": "h-12 w-12 rounded-full [&_svg]:size-6",
}
```

### What stays the same:
- All existing variant styles (default/destructive/outline/ghost/etc.) work as-is with icon buttons -- they map to Helix's Filled/Destructive/Outlined/Icon styles
- The `ascension` variant already has `rounded-full`
- No changes needed to any consuming components since existing `size="icon"` usage just gets the corrected shape and icon size

