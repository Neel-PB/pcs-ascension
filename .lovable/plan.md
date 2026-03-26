

## Fix Green Dot Clipping on Data Refresh Button

### Problem
The status dot (green/yellow/red) on the refresh button uses `absolute -top-0.5 -right-0.5` positioning, which extends outside the button boundary. The button clips it because it doesn't allow visible overflow.

### Change

**File: `src/components/dashboard/DataRefreshButton.tsx`**

Add `overflow-visible` to the Button className so the absolutely-positioned dot isn't clipped:

```tsx
// Current
<Button variant="ascension" size="icon" className={cn("relative", className)} ...>

// Updated
<Button variant="ascension" size="icon" className={cn("relative overflow-visible", className)} ...>
```

Single-line change. No other files affected.

