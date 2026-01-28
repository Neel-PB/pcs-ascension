

# Remove Entrance Animations from Filters and Tabs

## Problem

When clicking on the Positions module, the UI "scrambles" because multiple elements are animating in sequence:
1. Filters fade in with 0.3s animation
2. Tab buttons fade in with staggered 0.1s delays
3. Content animates in separately

This creates a visual "scramble" effect where elements appear at different times.

## Solution

Remove entrance animations from filters and tabs so they appear instantly. Keep only the:
- Tab indicator slide animation (for smooth tab switching)
- Content area animation (shows loader inside tabs, not the container)

## Changes

### File 1: `src/components/staffing/FilterBar.tsx`

**Current (lines 109-114):**
```tsx
<motion.div
  className={`flex flex-wrap xl:flex-nowrap gap-2 xl:gap-3 items-center ${className}`}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

**After:**
```tsx
<div className={`flex flex-wrap xl:flex-nowrap gap-2 xl:gap-3 items-center ${className}`}>
```

Also remove the unused `motion` import from line 2.

### File 2: `src/pages/positions/PositionsPage.tsx`

**Change 1 - Tab buttons (lines 102-118):**

Replace `motion.button` with regular `button` and remove entrance animation:

```tsx
// Before
<motion.button
  key={tab.id}
  className={...}
  onClick={() => setActiveTab(tab.id)}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  style={{ flex: 1 }}
>

// After - regular button, no entrance animation
<button
  key={tab.id}
  className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors z-10 hover:scale-[1.02] active:scale-[0.98] ${
    activeTab === tab.id
      ? "text-primary-foreground"
      : "text-muted-foreground hover:text-foreground"
  }`}
  onClick={() => setActiveTab(tab.id)}
  style={{ flex: 1 }}
>
```

**Change 2 - Content wrapper (lines 138-145):**

Remove `AnimatePresence` and `motion.div` from content wrapper - the individual tabs handle their own loading states internally:

```tsx
// Before
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="flex-1 min-h-0 flex flex-col animate-fade-in"
  >

// After - simple div, tabs have their own loaders
<div className="flex-1 min-h-0 flex flex-col">
```

**Keep the tab indicator animation** (lines 121-133) - this is the sliding highlight effect when switching tabs, which is desirable UX.

## Summary of What Stays vs What Gets Removed

| Element | Animation | Keep/Remove |
|---------|-----------|-------------|
| Filters (global) | Fade-in 0.3s | ❌ Remove |
| Filters (optional) | Fade-in 0.3s | ❌ Remove |
| Tab buttons | Staggered fade-in | ❌ Remove |
| Tab indicator | Slide on switch | ✅ Keep |
| Content wrapper | Fade on tab switch | ❌ Remove |
| Tab content loaders | Inside tabs | ✅ Keep (existing pattern) |

## Result

- Filters appear instantly when navigating to Positions
- Tabs appear instantly with no stagger
- Tab indicator still smoothly slides when switching tabs
- Content area loads with LogoLoader inside each tab (existing behavior)
- No more UI "scramble" effect

