

# Remove Blue Focus Ring Styling Across the App

## Problem

The blue focus ring (`focus-visible:ring-2 focus-visible:ring-ring`) appears on all interactive elements throughout the app when clicked or focused. The user finds this visually disruptive and wants to remove it.

---

## Current State

The focus ring styling comes from two sources:

1. **CSS Variable** in `src/index.css`:
   - `--ring: 217 91% 60%` (blue color used by `ring-ring` class)

2. **Component Classes** using patterns like:
   - `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
   - `focus:ring-2 focus:ring-ring focus:ring-offset-2`

Affected components include:
- Button, Input, Textarea, Checkbox, Switch
- Select triggers, Popover triggers
- Sidebar buttons and menu items
- Sheet close buttons
- CellButton and other table cells
- Many more (14+ files)

---

## Solution

Add a global CSS rule to hide the focus ring while preserving keyboard accessibility. This approach:
- Is minimal (one CSS rule vs editing 14+ component files)
- Can be easily reversed if needed
- Keeps the underlying structure for accessibility tools

### File: `src/index.css`

Add a new rule in the `@layer base` section:

```css
@layer base {
  /* Remove visible focus ring styling app-wide */
  *:focus,
  *:focus-visible {
    outline: none !important;
    box-shadow: none !important;
    --tw-ring-shadow: 0 0 #0000 !important;
  }
  
  /* ... existing base styles ... */
}
```

This will:
- Override all `focus:ring-*` and `focus-visible:ring-*` utilities
- Remove any native browser outlines
- Apply globally without needing to edit individual components

---

## Accessibility Note

Removing focus indicators can make keyboard navigation harder for users who rely on it. If accessibility is a concern later, we can:
1. Replace the blue ring with a more subtle indicator (e.g., slightly darker background)
2. Use a non-ring focus style (e.g., `focus-visible:bg-muted`)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add global focus ring removal CSS in `@layer base` |

---

## Alternative Approach (More Work, Finer Control)

If you prefer not to use `!important` or want finer control, I can instead:
- Edit each of the 14+ UI component files
- Remove `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` from each component

This is more surgical but requires ~15 file edits. Let me know if you prefer this approach.

