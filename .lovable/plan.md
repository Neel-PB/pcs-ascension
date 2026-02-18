

## Show Demo Dropdown Previews in Filter Tour Steps

### Problem
The tour highlights each filter dropdown but doesn't show what's inside. Users can't see what the dropdown contains during the guided tour.

### Solution
Embed mini visual mockups of each dropdown directly inside the tour tooltip content. This gives users a "demo" view of what each filter looks like when opened, without actually opening dropdowns or fetching data.

### Changes

**1. Update `TourTooltip` to support JSX content (`src/components/tour/TourTooltip.tsx`)**

Currently the tooltip renders `step.content as string` inside a `<p>` tag. Change it to render `step.content` as a React node (`React.ReactNode`) so we can pass rich JSX with styled mock dropdown previews.

Replace:
```tsx
<p className="text-sm text-muted-foreground leading-relaxed">
  {step.content as string}
</p>
```
With:
```tsx
<div className="text-sm text-muted-foreground leading-relaxed">
  {step.content}
</div>
```

Also widen the card slightly for filter steps (bump from `w-[340px]` to `max-w-[400px] w-auto min-w-[340px]`).

**2. Create filter demo preview components (`src/components/tour/FilterDemoPreview.tsx`)**

A small reusable component that renders a mock dropdown list showing 3-4 example items with the same styling as the real dropdowns (rounded border, items with hover state, search input placeholder for Facility/Department).

Variants:
- **SimpleSelect preview** (Region, Market): Shows "All Regions" + 2-3 example region names in a bordered list
- **Searchable preview** (Facility, Department): Shows a search input placeholder + name/ID two-column grid with 2-3 example rows
- **More Filters preview**: Shows Submarket, Level 2, PSTAT labels

**3. Update filter tour steps in `tourSteps.ts` to use JSX content**

Replace the plain string `content` for each filter step with JSX that includes:
- The text description (same as before)
- A `FilterDemoPreview` component below the text showing the mock dropdown

Example for Region:
```tsx
content: (
  <div className="space-y-3">
    <p>Select a Region to scope all data to that geographic area. Choosing a region updates the available Markets, Facilities, and Departments below.</p>
    <FilterDemoPreview variant="simple" items={['All Regions', 'East', 'Gulf Coast', 'West']} />
  </div>
)
```

Example for Facility (searchable):
```tsx
content: (
  <div className="space-y-3">
    <p>Search and select a specific Facility. Type a name or ID to find it quickly.</p>
    <FilterDemoPreview variant="searchable" items={[
      { name: 'St. Vincent Hospital', id: 'FAC001' },
      { name: 'Sacred Heart Medical', id: 'FAC002' },
      { name: 'Providence Clinic', id: 'FAC003' },
    ]} />
  </div>
)
```

### Mock Dropdown Styling

The demo preview will be a small bordered container (matching the app theme) with:
- A light background (`bg-muted/50`) and rounded border
- For searchable variants: a disabled search input at top with placeholder text
- 3-4 list items with padding, the first one highlighted (like "All Regions" selected)
- Items styled to match actual dropdown appearance
- Max height constrained so it doesn't make the tooltip too tall

### Files changed

| File | Change |
|------|--------|
| `src/components/tour/TourTooltip.tsx` | Render content as ReactNode instead of string; slightly wider card |
| `src/components/tour/FilterDemoPreview.tsx` | New component with Simple and Searchable mock dropdown variants |
| `src/components/tour/tourSteps.ts` | Update 6 filter steps (Region, Market, Facility, Department, Clear, More Filters) to use JSX content with demo previews |

