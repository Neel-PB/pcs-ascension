

# Align Badge Component to Helix Badge Spec

## What the Helix Spec Defines

From the Badge specs page:

| Property | Helix Spec | Current Implementation | Change Needed |
|----------|-----------|----------------------|---------------|
| Shape | Rounded-full (circle/pill) | `rounded-full` | No change |
| Numeric badge size | 20 x 20px | Variable (px-2.5 py-0.5) | Add compact sizing for numeric use |
| Dot badge size | 8 x 8px | Not supported | Add dot variant |
| Text styling | Body 3 Emphasis (font-medium) | `font-semibold` | Change to `font-medium` |
| Text alignment | Centered | `inline-flex items-center` | No change |
| "None" color | No fill, Content.Primary text | `outline` variant | Already close |
| "Primary" color | Primary.Main fill, inverse text | `default` variant | Already correct |
| "Success" color | Success.Main fill, inverse text | Not available | Add variant |
| "Warning" color | Warning.Main fill, inverse text | Not available | Add variant |
| "Error" color | Error.Main fill, inverse text | `destructive` variant | Already close |
| "Secondary" color | Secondary.Main fill, inverse text | `secondary` variant | Already correct |

## File to Edit

**`src/components/ui/badge.tsx`**

### Changes:
1. **Font weight**: `font-semibold` to `font-medium` -- Helix uses Body 3 Emphasis which maps to medium weight
2. **Add `success` variant**: `bg-green-600 text-white border-transparent` for success semantic color
3. **Add `warning` variant**: `bg-amber-500 text-white border-transparent` for warning semantic color
4. **Keep existing variants** (`default`, `secondary`, `destructive`, `outline`) as they already map well to Helix Primary, Secondary, Error, and None colors
5. **Remove hover opacity changes** from default/secondary/destructive -- Helix badges are static indicators, not interactive elements (hover effects are handled by parent containers where needed)

No other files need changes -- the Badge component is imported everywhere and the variant API stays the same, so all existing usages continue to work.

