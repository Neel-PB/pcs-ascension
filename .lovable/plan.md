

## Fix Snackbar Layout, Background, and Close Button Position

### Issues Found

1. **Close button on wrong side**: Sonner renders the close button as the first child element in the DOM. Setting `position: static` causes it to appear on the LEFT. Need to use `order: 9999` to push it to the end of the flex row.
2. **Unwanted background color**: The success/error/warning variant backgrounds (green tint, red tint, amber tint) should be removed. The Helix spec uses a neutral container background for all types.
3. **Icon and text alignment**: The checkmark icon and text need to flow naturally in order.

### Files to Change

**`src/index.css`** (lines ~380-425)

- Add `order: 9999 !important` to `[data-sonner-toast] [data-close-button]` to force it to the far right
- **Remove** all variant background color rules (lines 405-425): the `[data-type="success"]`, `[data-type="error"]`, `[data-type="warning"]` selectors and their dark mode counterparts

**`src/components/ui/sonner.tsx`**

- No structural changes needed; the close button class already has `!ml-auto` but needs the order fix from CSS

### Technical Details

CSS changes in `index.css`:

```css
/* Add to close button rule */
[data-sonner-toast] [data-close-button] {
  /* existing properties... */
  order: 9999 !important; /* Force to end of flex row */
}

/* DELETE these rules entirely: */
/* [data-sonner-toast][data-type="success"] { background-color: #ecfdf5 !important; } */
/* [data-sonner-toast][data-type="error"] { background-color: #fef2f2 !important; } */
/* [data-sonner-toast][data-type="warning"] { background-color: #fffbeb !important; } */
/* .dark [data-sonner-toast][data-type="success"] { ... } */
/* .dark [data-sonner-toast][data-type="error"] { ... } */
/* .dark [data-sonner-toast][data-type="warning"] { ... } */
```

This will result in:
- Close button (x) always on the far right
- Neutral background for all toast types (no green/red/amber tint)
- Layout order: Icon | Title/Description | Action | Close (x)

