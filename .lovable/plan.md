# Helix Design System – Project Standards

## Section 1: Viewport Height Chain (Flexbox, no manual calc)

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

## Section 2: Layout Key Rules

- Use `gap-4` for vertical spacing between sibling sections. Never `space-y-6`, `mb-6`, or manual margins.
- Use `min-h-0 max-h-full` on content areas, never `flex-1` (which forces stretching).
- Fixed-height elements (filters, tabs, toolbars) get `flex-shrink-0`.
- Table containers get `min-h-0 max-h-full overflow-hidden` so they shrink-wrap with few rows and scroll internally with many rows.
- No hardcoded pixel offsets or extra `calc()` expressions inside page components.

## Section 3: Layout Behavior

- Few rows: table card is short, page background visible below.
- Many rows: table fills available space and scrolls internally.
- Consistent 16px vertical rhythm across all modules.

## Section 4: Helix UI Component Standards

**Cards**
- Border radius: `rounded-xl` (12px)
- Shadow: `shadow-md`
- Internal padding: `px-4` (16px)

**Icon Buttons**
- Shape: fully rounded (`rounded-full`)
- Icon size: 24px

**Search Fields**
- Shape: pill-shaped (`rounded-full`)
- Blue circular search button
- Constant 2px border (no border-width change on focus)

**Badges**
- Shape: `rounded-full` pill
- Semantic colors (success/warning/danger/muted)

**Menus and Selects**
- Border radius: `rounded-lg` (8px)
- Minimum width: 210px
- All dropdown triggers use a blue brand chevron (`text-[#1D69D2]`) that rotates 180 degrees when open

**Calendar / Date Picker**
- Cell size: 40x40px
- Two-step confirmation (header + footer)

**Dialogs and Sheets**
- User Management forms: wide sheet layout (`sm:max-w-xl`, 576px)
- Structure: fixed header, scrollable middle, fixed footer

**Snackbars (Sonner)**
- Position: bottom-center
- Border radius: `rounded-lg`

**Focus and Selection**
- Focus: constant 2px primary border width (no outline ring)
- Selection: `bg-primary/15` + `border-primary/30` background tint only -- no checkmarks
- All visible focus rings suppressed globally via CSS

## Section 5: Spacing and Padding Defaults

- Page padding: `py-4 px-4` (16px, set by ShellLayout)
- Section gaps: `gap-4` (16px) between siblings
- Card internal padding: `px-4` (16px)
- Toolbar/search bar height: natural (~40px)
- Filter bar height: natural (~48px)
- Tab toggle height: natural (~44px)
- No manual margins between sections -- gap handles everything
