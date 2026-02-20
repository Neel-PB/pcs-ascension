
## Fix Table Height: Use Flex Layout Instead of Pixel Offsets

### Problem
The current approach uses hardcoded pixel offsets (`calc(100vh - var(--header-height) - 340px)`) to constrain table height. This is fragile -- if any element above the table changes height, the offset breaks. The correct approach is to let CSS flexbox calculate the remaining space automatically.

### How It Works

The layout hierarchy from top to bottom:

```text
100vh
  - Header (var(--header-height))                  -- fixed
  = Main content area (shell provides this)
    - Shell padding (py-4 = 16px top + 16px bottom) -- fixed
    - Filter bar (~56px)                            -- fixed
    - Tab navigation (~52px + mb-6 gap)             -- fixed
    - Tab content (REMAINING SPACE)                 -- should flex-grow
      - Section header (title, toggles, legend)     -- fixed
      - TABLE (REMAINING SPACE)                     -- should flex-grow
```

Instead of guessing offsets, we make each container a flex column and let the table area take `flex-1 min-h-0` (the remaining space).

### Files to Change

| File | Change |
|------|--------|
| `src/pages/staffing/StaffingSummary.tsx` | Make outer container a flex column with `h-[calc(100vh-var(--header-height)-2rem)]` and content area `flex-1 min-h-0` |
| `src/pages/staffing/PositionPlanning.tsx` | Change outer `space-y-6` to `flex flex-col gap-6 h-full`; change table wrapper from `max-h-[calc(...)]` to `flex-1 min-h-0` |
| `src/pages/staffing/VarianceAnalysis.tsx` | Same pattern: flex column layout, table wrapper gets `flex-1 min-h-0` instead of `max-h-[calc(...)]` |
| `src/pages/staffing/ForecastTab.tsx` | Change to flex column with `h-full`, table area gets `flex-1 min-h-0` |
| `src/components/forecast/ForecastBalanceTable.tsx` | Change Card to `h-full flex flex-col`, inner scroll div uses `flex-1 min-h-0` instead of `max-h-[calc(...)]` |

### Detailed Changes

**1. StaffingSummary.tsx (lines 511, 542)**

The outermost `div.space-y-6` becomes a flex column with a constrained height. The inner content div (line 542) that renders tab content gets `flex-1 min-h-0`.

```typescript
// Line 511: outer container
<div className="flex flex-col h-[calc(100vh-var(--header-height)-2rem)]">

// Line 542: tab content container  
<div className="flex-1 min-h-0">
```

The filter bar and tab navigation remain as-is (they take their natural height). Only the tab content area flexes.

**2. PositionPlanning.tsx (lines 744, 533)**

The root wrapper becomes a flex column filling available height:
```typescript
// Line 744: outer wrapper
<div className="flex flex-col gap-6 h-full">

// Line 533: table scroll container -- remove max-h calc, use flex-1
<div className="overflow-auto flex-1 min-h-0 [&>div]:overflow-visible">
```

The table card wrapper (line 963) also needs `flex-1 min-h-0 flex flex-col` so the scroll container inside it can flex.

**3. VarianceAnalysis.tsx (lines 664, 723)**

Same flex column approach:
```typescript
// Line 664: outer wrapper
<div className="flex flex-col gap-6 h-full">

// Line 723: table container -- remove max-h calc, use flex-1
className="rounded-xl border shadow-sm bg-card overflow-auto flex-1 min-h-0 [&>div]:overflow-visible"
```

**4. ForecastTab.tsx (line 47)**

```typescript
// Line 47: outer wrapper
<div className="flex flex-col gap-6 h-full">

// Line 63: ForecastBalanceTable wrapper needs to flex
<div className="flex-1 min-h-0">
  <ForecastBalanceTable ... />
</div>
```

**5. ForecastBalanceTable.tsx (line 40-41)**

```typescript
// Line 40: Card becomes flex column filling parent
<Card className="overflow-hidden h-full flex flex-col">
  // Line 41: scroll div uses flex-1 instead of max-h
  <div className="border rounded-md flex-1 min-h-0 overflow-auto">
```

### Why This Is Better
- No magic pixel numbers to maintain
- Automatically adapts to any viewport size
- If filters, tabs, or headers change height, the table area adjusts automatically
- The table always fills exactly the remaining space -- no page scroll, no extra gap at the bottom
