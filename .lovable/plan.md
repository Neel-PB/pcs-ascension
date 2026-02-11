

# Align Card Component to Helix Card Spec

## What the Helix Spec Defines

From the Card specs page:

| Property | Helix Spec | Current Implementation | Change Needed |
|----------|-----------|----------------------|---------------|
| Shape | `rounded-lg` (20px) | `rounded-lg` (8px default) | Increase to `rounded-xl` (12px) or `rounded-2xl` (16px) -- closest to 20px without custom value |
| Elevation (raised) | `shadow-md` | `shadow-sm` | Increase to `shadow-md` for raised cards |
| Background | Background.Component (`bg-card`) | `bg-card` | No change |
| Left/Right padding | 16px (`px-4`) | `p-6` (24px) on CardHeader/Content/Footer | Adjust horizontal to `px-4` |
| Top/Bottom padding | 24px (`py-6`) | `p-6` (24px) on CardHeader | Already correct vertically |
| Content spacing | 16px recommended | `space-y-1.5` in CardHeader | Keep flexible |
| Stacking gap | 32px between cards | Varies by usage | No base change needed |
| Header between card | 20px | Varies | No base change needed |
| Header font | Title SM | `text-2xl font-semibold` | Reduce to `text-lg font-semibold` |
| Body copy | Body BASE | `text-sm` | Change to `text-base` for CardDescription |
| Border | Visible border | `border` | No change |

## File to Edit

**`src/components/ui/card.tsx`**

### Changes:
1. **Border radius**: `rounded-lg` to `rounded-xl` -- Helix specifies 20px; `rounded-xl` (12px) is the closest standard Tailwind step without a custom value, or use `rounded-[20px]` for exact match
2. **Shadow**: `shadow-sm` to `shadow-md` -- Helix raised cards use `shadow-md`
3. **CardHeader padding**: `p-6` to `px-4 py-6` -- Helix specifies 16px horizontal, 24px vertical
4. **CardContent padding**: `p-6 pt-0` to `px-4 pb-6` -- match 16px horizontal padding
5. **CardFooter padding**: `p-6 pt-0` to `px-4 pb-6` -- match 16px horizontal padding
6. **CardTitle font size**: `text-2xl` to `text-lg` -- Helix "Title SM" is smaller than the current 2xl
7. **CardDescription font size**: Keep `text-sm` since most card descriptions in the app are used as secondary labels (changing to `text-base` would be too large for current layouts)

These changes affect every Card usage across the app (KPI cards, AI welcome cards, forecast cards, analytics cards, etc.) but since all cards should follow the same Helix spec, this is the desired outcome. Components that override padding via className will continue to work as before.

