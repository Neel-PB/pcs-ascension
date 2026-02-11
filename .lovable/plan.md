

# Sidebar Navigation Labels -- UPPERCASE

## Change

Update the sidebar navigation item labels to render in uppercase text across both sidebar components.

## Files to Edit

### 1. `src/components/layout/DynamicIconOnlySidebar.tsx`
- On the `<span>` that renders `{module.label}` (around line 80), add `uppercase` to the className

### 2. `src/components/shell/AppSidebar.tsx`
- On the `<span>` elements that render item titles (around lines 88 and 121), add `uppercase` to the className
- Also update the "Admin" label span and the "Feedback" label span

Both changes are single-word class additions to existing `<span>` elements.

