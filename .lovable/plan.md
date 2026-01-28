
# Standardize Loading Patterns Across Application

## Problem

Multiple pages still have staggered entrance animations on static elements (tabs, page wrappers) causing a "scramble" effect when navigating:

1. **AnalyticsRegion.tsx** - motion.div page wrapper + motion.button tabs + AnimatePresence content
2. **StaffingSummary.tsx** - motion.button tabs with staggered delays + AnimatePresence content
3. **AdminPage.tsx** - motion.button tabs with staggered delays + AnimatePresence content
4. **ReportsRegion.tsx** - motion.div page wrapper + motion.button tabs + AnimatePresence content
5. **SupportPage.tsx** - motion.div page wrapper + motion.button tabs + AnimatePresence content

## Solution

Apply the same pattern already working in PositionsPage.tsx to all pages:

1. **Static elements render instantly** - tabs, filters, page structure
2. **Keep tab indicator animation** - the sliding highlight when switching tabs
3. **Remove content wrapper animation** - AnimatePresence/motion.div around content
4. **Content components handle their own loading** - using LogoLoader internally

## Changes by File

### 1. `src/pages/analytics/AnalyticsRegion.tsx`

| Line | Element | Change |
|------|---------|--------|
| 24-28 | Page wrapper | Replace `motion.div` with regular `div`, remove entrance animation |
| 34-50 | Tab buttons | Replace `motion.button` with `button`, remove initial/animate/transition |
| 70-88 | Content wrapper | Remove `AnimatePresence` and `motion.div`, use plain `div` |

### 2. `src/pages/staffing/StaffingSummary.tsx`

| Line | Element | Change |
|------|---------|--------|
| 498-514 | Tab buttons | Replace `motion.button` with `button`, remove initial/animate/transition |
| 534-541 | Content wrapper | Remove `AnimatePresence` and `motion.div`, use plain `div` |

### 3. `src/pages/admin/AdminPage.tsx`

| Line | Element | Change |
|------|---------|--------|
| 81-98 | Tab buttons | Replace `motion.button` with `button`, remove initial/animate/transition |
| 118-125 | Content wrapper | Remove `AnimatePresence` and `motion.div`, use plain `div` |

### 4. `src/pages/reports/ReportsRegion.tsx`

| Line | Element | Change |
|------|---------|--------|
| 38-43 | Page wrapper | Replace `motion.div` with regular `div`, remove entrance animation |
| 48-64 | Tab buttons | Replace `motion.button` with `button`, remove initial/animate/transition |
| 84-91 | Content wrapper | Remove `AnimatePresence` and `motion.div`, use plain `div` |

### 5. `src/pages/support/SupportPage.tsx`

| Line | Element | Change |
|------|---------|--------|
| 130-135 | Page wrapper | Replace `motion.div` with regular `div`, remove entrance animation |
| 164-180 | Tab buttons | Replace `motion.button` with `button`, remove initial/animate/transition |
| 200-207 | Content wrapper | Remove `AnimatePresence` and `motion.div`, use plain `div` |

## What Stays vs What Gets Removed

| Element | Description | Keep/Remove |
|---------|-------------|-------------|
| Page wrapper animation | Fade-in on page load | Remove |
| Tab button entrance | Staggered fade-in | Remove |
| Tab indicator slide | Sliding highlight on tab switch | Keep |
| Content wrapper animation | Fade on tab switch | Remove |
| Content internal loaders | LogoLoader inside components | Keep (existing pattern) |

## Before/After Examples

**Tab Button - Before:**
```tsx
<motion.button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  style={{ flex: 1 }}
>
```

**Tab Button - After:**
```tsx
<button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  className="... hover:scale-[1.02] active:scale-[0.98]"
  style={{ flex: 1 }}
>
```

**Content Wrapper - Before:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {/* content */}
  </motion.div>
</AnimatePresence>
```

**Content Wrapper - After:**
```tsx
<div>
  {/* content - each tab handles its own loading state */}
</div>
```

## Expected Result

- All pages load with tabs and filters instantly visible
- No staggered animation when navigating to any page
- Tab switching still has smooth indicator animation
- Data-dependent content shows LogoLoader while fetching
- Consistent experience across Staffing, Positions, Analytics, Admin, Reports, and Support pages

## Files to Modify

1. `src/pages/analytics/AnalyticsRegion.tsx`
2. `src/pages/staffing/StaffingSummary.tsx`
3. `src/pages/admin/AdminPage.tsx`
4. `src/pages/reports/ReportsRegion.tsx`
5. `src/pages/support/SupportPage.tsx`
