

## Adopt Ascension Brand Blue Color Palette

### Overview
Update the CSS custom properties in `src/index.css` to use the official Ascension Brand Blue palette from the spec image. The current primary blue (#2563EB / Tailwind blue-600) will be replaced with the brand-correct #1E69D2 and its derived shades.

### Color Mapping from Spec

| Swatch | Hex       | HSL (approx)         | Usage                          |
|--------|-----------|----------------------|--------------------------------|
| 900    | #051D64   | 222 91% 21%          | Darkest accent                 |
| 800    | #092A79   | 223 88% 25%          | Light-mode auxiliary           |
| 700    | #0F3C97   | 219 82% 33%          | Deep brand                     |
| 600    | #1551B4   | 216 80% 39%          | Hover/active states            |
| 500    | #1E69D2   | 211 75% 47%          | Light-mode main (primary)      |
| 400    | #5194E3   | 214 73% 60%          | Dark-mode auxiliary            |
| 300    | #75B3F1   | 213 82% 70%          | Medium accent                  |
| 200    | #A4D3FA   | 212 90% 81%          | Dark-mode main (primary)       |
| 100    | #D1EAFC   | 208 91% 90%          | Aux background                 |
| 50     | #E8F5FE   | 205 93% 95%          | Main background tint           |

### Changes (single file: `src/index.css`)

**Light Mode (:root)**
- `--primary`: 217 91% 60% --> `211 75% 47%` (500 #1E69D2 -- the main brand blue)
- `--primary-weak`: 214 95% 93% --> `205 93% 95%` (50 #E8F5FE -- main background tint)
- `--primary-weak-2`: 214 88% 85% --> `208 91% 90%` (100 #D1EAFC -- aux background tint)
- `--ring`: 217 91% 60% --> `211 75% 47%` (match primary)
- `--sidebar-primary`: 217 91% 60% --> `211 75% 47%` (match primary)
- `--sidebar-ring`: 217 91% 60% --> `211 75% 47%` (match primary)
- Gradient endpoint updated from `hsl(217 91% 55%)` to `hsl(216 80% 39%)` (600 for depth)

**Dark Mode (.dark)**
- `--primary`: 217 91% 60% --> `212 90% 81%` (200 #A4D3FA -- dark-mode main)
- `--primary-weak`: 217 50% 25% --> `214 73% 60%` (400 #5194E3 area, at ~25% lightness for bg usage: `214 50% 25%`)
- `--primary-weak-2`: 217 50% 30% --> `214 50% 30%` (slightly adjusted)
- `--ring`: 217 91% 60% --> `212 90% 81%` (match primary)
- `--sidebar-primary`: 217 91% 60% --> `212 90% 81%` (match primary)
- `--sidebar-ring`: 217 91% 60% --> `212 90% 81%` (match primary)
- Gradient endpoints updated to use 200/300 range for dark mode

### What stays the same
- All non-blue colors (success, warning, danger, backgrounds, borders, foregrounds)
- Layout dimensions, radius, shadows
- Dark mode background/card lightness levels
- All component files -- only CSS variables change so everything updates automatically

### Risk
Low -- the change is purely CSS custom property values in one file. Every component using `bg-primary`, `text-primary`, `border-primary`, etc. will automatically pick up the new brand blue.

