

## Enhance Positions Tour Demo Previews for Better Visibility

### Problem
The Active FTE, Shift Override, and Comments workflow wireframes inside tour tooltips blend into the surrounding content. They aren't visually distinct enough, making them easy to miss during the guided tour.

### Changes

#### 1. Enhance `PositionsDemoPreview.tsx` -- Make wireframes visually prominent

Update the outer container styling for all three preview variants to add:
- A stronger highlight border using the primary color (`border-primary/25` instead of `border-border`)
- A subtle primary-tinted background (`bg-primary/[0.03]`)
- Centered alignment for the workflow content
- A subtle left accent bar on each state row for visual flow emphasis
- Slightly larger connector lines between states

**Specific changes to each preview's outer `div`:**

Current:
```
className="rounded-lg border border-border bg-card p-2.5 space-y-2 mt-1"
```

New:
```
className="rounded-lg border border-primary/20 bg-primary/[0.02] p-3 space-y-2.5 mt-2 shadow-sm ring-1 ring-primary/10"
```

**Enhance state connector lines** (the vertical `w-px h-2 bg-border` dividers between steps):

Current:
```
className="ml-3 w-px h-2 bg-border"
```

New:
```
className="ml-3 w-0.5 h-3 bg-primary/20 rounded-full"
```

**Enhance the section title** to be more prominent:

Current:
```
className="text-[9px] font-semibold text-foreground/80 uppercase tracking-wide"
```

New:
```
className="text-[10px] font-semibold text-primary uppercase tracking-wider"
```

#### 2. Enhance `CellStateRow` -- Add left accent and better contrast

Current row wrapper:
```
className="flex-1 flex items-center gap-1 rounded border border-border bg-background px-2 py-1 min-h-[28px]"
```

New:
```
className="flex-1 flex items-center gap-1 rounded border border-border bg-background px-2 py-1.5 min-h-[30px] border-l-2 border-l-primary/30"
```

This adds a small primary-colored left accent to each workflow state, making the 3-step progression visually distinct.

#### 3. Center the description text in `positionsTourSteps.ts`

Update the `positionsDemoContent` helper to center-align the text and add a subtle separator before the preview:

Current:
```typescript
const positionsDemoContent = (text: string, variant: string) =>
  createElement('div', { className: 'space-y-3' },
    createElement('p', null, text),
    createElement(PositionsDemoPreview, { variant } as any)
  );
```

New:
```typescript
const positionsDemoContent = (text: string, variant: string) =>
  createElement('div', { className: 'space-y-3 text-center' },
    createElement('p', { className: 'text-left' }, text),
    createElement('div', { className: 'flex justify-center' },
      createElement(PositionsDemoPreview, { variant } as any)
    )
  );
```

This ensures the wireframe preview block is horizontally centered within the tooltip.

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsDemoPreview.tsx` | Enhance outer container with primary-tinted border/bg/ring, stronger connector lines, accent on state rows, bolder section title |
| `src/components/tour/positionsTourSteps.ts` | Center the demo preview within the tooltip content wrapper |

### What stays unchanged
- All step targets, placement values, and `wideTooltip` flags
- Tour flow logic in `PositionsTour.tsx`
- Scroll/overflow management
- All other tour modules (Staffing, Admin, Header, Overlays)
