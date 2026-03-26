

## Fix Card Expanding Direction (Grow Downward, Not Upward)

The card is centered with `items-center` on the parent flex container, so when its height increases (adding password field), it expands equally top and bottom — visually shifting upward. Fix: align the card to top-center with a margin approach so it stays pinned and only grows downward.

### Change

**File: `src/pages/AuthPage.tsx`** (line 89)

Change the outer container from `items-center` to `items-start` with a top padding/margin to visually center it but anchor growth downward:

```tsx
// Before
<div className="min-h-screen h-screen overflow-auto flex items-center justify-center ...">

// After  
<div className="min-h-screen h-screen overflow-auto flex items-start justify-center pt-[25vh] ...">
```

This pins the card's top edge so additional fields push the card downward only. The `pt-[25vh]` places it roughly where center was, but anchored from top.

### Result
- Card top stays fixed when transitioning between steps
- Height growth happens downward only
- One line changed

