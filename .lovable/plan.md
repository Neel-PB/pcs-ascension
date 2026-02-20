

## Fix Table Card Not Filling Remaining Space

### Root Cause

The shell's `<main>` element in `ShellLayout.tsx` has `overflow-y-scroll`, which allows content to overflow and scroll rather than being constrained to fit. This breaks the flex layout chain -- child components can grow beyond the available space instead of being forced to fit within it.

Additionally, StaffingSummary uses a manual calc `h-[calc(100vh-var(--header-height)-2rem)]` when it could simply use `h-full` since the `<main>` already defines the exact available height (with padding accounted for via `box-sizing: border-box`).

### The Fix (2 files)

**1. ShellLayout.tsx** -- Change `overflow-y-scroll` to `overflow-y-auto` on the `<main>` element. This still allows scrolling on pages that need it (like Summary tab with KPI cards) but stops forcing a scrollbar. More importantly, the staffing page's own height constraint will prevent overflow entirely.

**2. StaffingSummary.tsx** -- Simplify the outer container from `h-[calc(100vh-var(--header-height)-2rem)]` to `h-full overflow-hidden`. Since `<main>` already has `height: calc(100vh - var(--header-height))` and `py-4` (32px), a child with `h-full` gets exactly the remaining content area. Adding `overflow-hidden` ensures no content escapes the flex container.

### Why This Fixes It

```text
main (height: calc(100vh - header), py-4, overflow-y-auto)
  StaffingSummary (h-full, overflow-hidden, flex-col, gap-4)
    FilterBar          -> natural height
    TabNavigation      -> natural height
    TabContent (flex-1 min-h-0)
      PositionPlanning (h-full, flex-col, gap-4)
        SectionHeader  -> natural height
        TableCard (flex-1 min-h-0, flex-col)
          FTESkillShiftTable (flex-1 min-h-0, overflow-auto)
```

With `h-full` and `overflow-hidden` on StaffingSummary, the flex chain is fully constrained. The table card MUST fill the remaining space because every parent enforces its height boundary.

### Technical Changes

| File | Line | Current | New |
|------|------|---------|-----|
| `src/components/shell/ShellLayout.tsx` | 43 | `overflow-y-scroll` | `overflow-y-auto` |
| `src/pages/staffing/StaffingSummary.tsx` | 511 | `h-[calc(100vh-var(--header-height)-2rem)]` | `h-full overflow-hidden` |
