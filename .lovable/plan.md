

## Add Comprehensive Helix Design System Reference to Plan

### Goal

Replace the current single-issue content in `.lovable/plan.md` with a complete Helix Design System specification. This ensures every future component, page, or feature is built consistently without needing to rediscover patterns.

### Change

| File | Change |
|------|--------|
| `.lovable/plan.md` | Replace entire contents with the full Helix Design System reference document |

### New Plan Contents

The document will be structured into these sections:

**1. Brand and Color Palette**
- Primary: Ascension Brand Blue (`#1E69D2` / HSL `211 75% 47%`)
- Auxiliary shades: 50 (`#E8F5FE`), 100 (`#D1EAFC`), 600 (`#1551B4`)
- Semantic tokens: `--success`, `--warning`, `--danger`
- Shell tokens: `--bg`, `--bg-elev`, `--line`, `--text-muted`, `--text-subtle`
- Card/background: `--card`, `--background`, `--popover` (mapped for light/dark)

**2. Typography**
- Font family: Whitney (weights 300-700 with italics), loaded via `@font-face` in `index.css`
- Sizes: `text-sm` (14px) for body/table content, `text-xs` (12px) for badges/labels, 18-24px for page titles
- Colors: `text-foreground` (primary), `text-muted-foreground` (secondary), `text-destructive` (errors), `text-primary` for brand blue accents

**3. Layout and Spacing**
- Page roots: `h-full flex flex-col gap-4 overflow-hidden`
- Content containers: `px-6` (24px) horizontal padding to align with header
- Vertical rhythm: `gap-4` (16px) everywhere -- no manual `mb-*` or `space-y-*`
- Shrink-wrap pattern for scrollable areas: `min-h-0 max-h-full overflow-auto`
- Fixed elements (tabs, filters, toolbars): `flex-shrink-0`
- Shell height chain: `h-[calc(100vh-var(--header-height))]` in ShellLayout

**4. Card**
- Classes: `bg-card border border-border rounded-xl shadow-md px-4`
- Corner radius: `rounded-xl` (12px)
- Internal padding: `px-4` (16px) -- not `p-6`
- Shadow: `shadow-md`

**5. Search Field**
- Component: `SearchField` from `@/components/ui/search-field` paired with `useDebouncedSearch` hook
- Shape: `rounded-full` (pill), constant `border-2` width, `h-11` height
- Blue circular search button on right side
- Focus: `border-primary` (no outline ring, no border-width shift)

**6. Buttons**
- `ascension` variant: pill-shaped primary button
- `icon` variant: `rounded-full h-11 w-11` with 24px icons (for header/toolbars)
- All interactive header elements standardized to `h-11` (44px)

**7. Toggle Button Group (Tabs)**
- Component: `ToggleButtonGroup` from `@/components/ui/toggle-button-group`
- Shape: `rounded-full border-2 border-primary p-1`
- Segments: `flex-1` equal width, `px-5 py-2`
- Active state: `bg-primary text-primary-foreground` with `motion.div` layoutId animation (tween, 0.2s, easeOut)
- Inactive: `text-foreground hover:bg-muted/50`
- Each usage must have a unique `layoutId` (use `React.useId()` if needed)

**8. Select / Dropdown**
- Trigger: `rounded-lg` (8px), `border-2 border-input`, `px-4 py-3` (~48px height)
- Blue brand chevron: `text-[#1D69D2]` with 200ms `transition-transform rotate-180` when open
- Selection state: `bg-primary/15` tint (no checkmark icons)
- Content: `min-w-[210px]`
- Open state: `border-primary` on trigger

**9. Badge**
- Shape: `rounded-full` pill
- Semantic color variants (success, warning, danger, etc.)

**10. Icons**
- Import: strictly from `@/lib/icons` (Material Design re-exports with Lucide names)
- Sizes: 24px (`size-6`) for navigation/header, 14-16px for table actions

**11. Table**
- Component: `EditableTable` or `Table` primitives
- Zebra striping: alternating `muted/30` via `TableBody`
- Cell values left-aligned with `flex-1 min-w-0`, action icons after value with `gap-2`

**12. Dialogs and Sheets**
- User Management sheets: `sm:max-w-xl` (576px)
- Structure: fixed header + fixed footer + scrollable middle section

**13. Filter Triggers**
- Consistent ~48px height (`px-4 py-3`), `rounded-lg`, `border-2 border-input`
- Blue brand chevron with 200ms rotation
- Popover-based triggers: conditional `border-primary` when open
- Cascading filter pattern (Region -> Market -> Facility -> Department)

**14. Focus Behavior**
- Global suppression of outline rings and border-width shifts (in `index.css`)
- Focus state: constant `border-2 border-primary` (no width change)

**15. Scrollbar**
- Thin custom scrollbar: 8px width, `muted` track, `muted-foreground/0.3` thumb
- Dark mode adjusted to `/0.4` and `/0.6` on hover

**16. Toast / Snackbar**
- Sonner with 500ms enter / 400ms exit timing
- Close button repositioned inline via CSS overrides

**17. Shadows**
- `--shadow-soft`: subtle `0 1px 2px`
- `--shadow-medium`: `0 4px 6px -1px` (used as `shadow-md` default)
- `--shadow-large`: `0 10px 15px -3px`
- Dark mode: increased opacity (0.3 / 0.4 / 0.5)

**18. Animations**
- `fadeIn`: 0.3s ease-out, translateY(10px) to 0
- `slideIn`: 0.3s ease-out, translateX(-10px) to 0
- Accordion: 0.2s ease-out
- Tab transitions: tween 0.2s easeOut

