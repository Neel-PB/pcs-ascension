# Layout and Spacing Standards

## 1. Viewport Height Chain (Flexbox, no manual calc)

```text
ShellLayout (<main>)
  height: calc(100vh - var(--header-height))   <-- only calc in the system
  overflow-y: auto
  padding: py-4 px-4 (16px)

  PageRoot (outer div)
    h-full                <-- fills parent
    flex flex-col
    gap-4                 <-- uniform 16px between all children
    overflow-hidden       <-- prevents double scrollbar

    FilterBar / KPIs      <-- flex-shrink-0 (natural height)
    Tabs / Toggle         <-- flex-shrink-0 (natural height)
    Content Area          <-- min-h-0 max-h-full (shrink-wrap / cap)

      Toolbar (search, buttons)  <-- flex-shrink-0
      Table / Card               <-- min-h-0 max-h-full
```

## 2. Key Rules

- Use `gap-4` for vertical spacing between sibling sections. Never `space-y-6`, `mb-6`, or manual margins.
- Use `min-h-0 max-h-full` on content areas, never `flex-1` (which forces stretching).
- Fixed-height elements (filters, tabs, toolbars) get `flex-shrink-0`.
- Table containers get `min-h-0 max-h-full overflow-hidden` so they shrink-wrap with few rows and scroll internally with many rows.
- No hardcoded pixel offsets or extra `calc()` expressions inside page components.

## 3. Behavior

- Few rows: table card is short, page background visible below.
- Many rows: table fills available space and scrolls internally.
- Consistent 16px vertical rhythm across all modules.
