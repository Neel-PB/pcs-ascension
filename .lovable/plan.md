

## Fix Sticky Header Border Visibility on Scroll

### Problem
When scrolling the Variance Analysis and Position Planning tables, the sticky header loses its bottom border and content bleeds through because:
1. `bg-muted/30` on `TableHead` cells is semi-transparent — scrolled content shows through
2. No explicit bottom border on the last header row

### Changes

**1. `src/pages/staffing/VarianceAnalysis.tsx`**
- On `TableHeader`: add `border-b border-border` and change `bg-card` to ensure opacity
- On all `TableHead` cells with `bg-muted/30`: change to `bg-muted` (fully opaque) so content doesn't bleed through on scroll
- Applies to both the skill-header row (line 646) and sub-header row (line 654)

**2. `src/pages/staffing/PositionPlanning.tsx`**
- Same fix: add `border-b border-border` to `TableHeader`
- Change all `bg-muted/30` on `TableHead` cells to `bg-muted` for full opacity
- Applies to header row (line 413) and sub-header row (line 435)

### Why this fixes it
- `bg-muted` is fully opaque — no content bleed-through
- `border-b border-border` on the `TableHeader` ensures the dividing line stays visible when sticky

