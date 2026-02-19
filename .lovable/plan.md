

## Fix: Sticky Headers Not Working on Planning and Variance Tables

### Root Cause

The `Table` UI component wraps `<table>` inside its own `<div className="relative w-full overflow-auto">`. This creates two nested scroll containers:

```text
<div class="overflow-auto max-h-[600px]">         <-- outer (has height limit)
  <div class="relative w-full overflow-auto">      <-- Table's inner wrapper (no height limit, expands fully)
    <table>
      <thead class="sticky top-0">                 <-- sticks to inner div, which never scrolls
```

The `sticky` header binds to its nearest scrolling ancestor — the inner div — which has no height constraint and expands to full content height. So the outer div scrolls, but the header isn't sticky relative to it.

### Fix

Override the inner div's overflow on the outer wrapper using a Tailwind child selector so there's only ONE scroll container:

**`src/pages/staffing/PositionPlanning.tsx`** (line 533):
```
<div className="overflow-auto max-h-[600px] [&>div]:overflow-visible">
```

**`src/pages/staffing/VarianceAnalysis.tsx`** (line 723):
```
className="rounded-xl border shadow-sm bg-card overflow-auto max-h-[600px] [&>div]:overflow-visible"
```

The `[&>div]:overflow-visible` neutralizes the Table component's inner wrapper, making the outer div the single scroll context. The sticky header then works correctly.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/staffing/PositionPlanning.tsx` | Add `[&>div]:overflow-visible` to table container |
| `src/pages/staffing/VarianceAnalysis.tsx` | Add `[&>div]:overflow-visible` to table container |

