# Helix Design System Reference

All components, pages, and features MUST follow these standards.

---

## 1. Brand & Color Palette

- **Primary**: Ascension Brand Blue `#1E69D2` / HSL `211 75% 47%`
- **Auxiliary**: 50 `#E8F5FE`, 100 `#D1EAFC`, 600 `#1551B4`
- **Semantic tokens**: `--success` (142 71% 45%), `--warning` (45 93% 47%), `--danger` (0 72% 51%)
- **Shell tokens**: `--bg`, `--bg-elev`, `--line`, `--text-muted`, `--text-subtle`
- **Card/background**: `--card`, `--background`, `--popover` (mapped for light/dark)
- All colors use HSL via CSS variables — never hardcode hex/rgb in components

## 2. Typography

- **Font**: Whitney (weights 300–700 + italics), `@font-face` in `index.css`
- **Sizes**: `text-sm` (14px) body/table, `text-xs` (12px) badges/labels, 18–24px page titles
- **Colors**: `text-foreground` (primary), `text-muted-foreground` (secondary), `text-destructive` (errors), `text-primary` (brand blue accents)

## 3. Layout & Spacing

- Page roots: `h-full flex flex-col gap-4 overflow-hidden`
- Content padding: `px-6` (24px) to align with header
- Vertical rhythm: `gap-4` (16px) everywhere — no manual `mb-*` or `space-y-*`
- Scrollable areas: `min-h-0 max-h-full overflow-auto` (shrink-wrap pattern)
- Fixed elements (tabs, filters, toolbars): `flex-shrink-0`
- Shell height: `h-[calc(100vh-var(--header-height))]` in ShellLayout

## 4. Card

- Classes: `bg-card border border-border rounded-xl shadow-md px-4`
- Corner radius: `rounded-xl` (12px)
- Internal padding: `px-4` (16px) — not `p-6`
- Shadow: `shadow-md`

## 5. Search Field

- Component: `SearchField` from `@/components/ui/search-field` + `useDebouncedSearch` hook
- Shape: `rounded-full`, constant `border-2`, `h-11`
- Blue circular search button on right
- Focus: `border-primary` (no outline ring, no border-width shift)

## 6. Buttons

- `ascension` variant: pill-shaped primary button
- `icon` variant: `rounded-full h-11 w-11` with 24px icons (header/toolbars)
- All interactive header elements: `h-11` (44px)

## 7. Toggle Button Group (Tabs)

- Component: `ToggleButtonGroup` from `@/components/ui/toggle-button-group`
- Shape: `rounded-full border-2 border-primary p-1`
- Segments: `flex-1` equal width, `px-5 py-2`
- Active: `bg-primary text-primary-foreground` with `motion.div` layoutId animation (tween, 0.2s, easeOut)
- Inactive: `text-foreground hover:bg-muted/50`
- Each usage needs a unique `layoutId` (use `React.useId()` if needed)

## 8. Select / Dropdown

- Trigger: `rounded-lg` (8px), `border-2 border-input`, `px-4 py-3` (~48px)
- Blue brand chevron: `text-[hsl(211,75%,47%)]` with 200ms `transition-transform rotate-180` when open
- Selection state: `bg-primary/15` tint (no checkmark icons)
- Content: `min-w-[210px]`
- Open state: `border-primary` on trigger

## 9. Badge

- Shape: `rounded-full` pill
- Semantic color variants (success, warning, danger, etc.)

## 10. Icons

- Import: strictly from `@/lib/icons` (Material Design re-exports with Lucide names)
- Sizes: 24px (`size-6`) navigation/header, 14–16px table actions

## 11. Table

- Component: `EditableTable` or `Table` primitives
- Zebra striping: alternating `muted/30` via `TableBody`
- Cell values left-aligned with `flex-1 min-w-0`, action icons after value with `gap-2`

## 12. Dialogs & Sheets

- User Management sheets: `sm:max-w-xl` (576px)
- Structure: fixed header + fixed footer + scrollable middle

## 13. Filter Triggers

- Height ~48px (`px-4 py-3`), `rounded-lg`, `border-2 border-input`
- Blue brand chevron with 200ms rotation
- Popover triggers: conditional `border-primary` when open
- Cascading pattern: Region → Market → Facility → Department

## 14. Focus Behavior

- Global suppression of outline rings and border-width shifts (in `index.css`)
- Focus state: constant `border-2 border-primary` (no width change)

## 15. Scrollbar

- Thin custom: 8px width, `muted` track, `muted-foreground/0.3` thumb
- Dark mode: `/0.4` thumb, `/0.6` on hover

## 16. Toast / Snackbar

- Sonner: 500ms enter / 400ms exit
- Close button repositioned inline via CSS overrides

## 17. Shadows

- `--shadow-soft`: `0 1px 2px rgba(0,0,0,0.05)`
- `--shadow-medium`: `0 4px 6px -1px rgba(0,0,0,0.1)` (= `shadow-md`)
- `--shadow-large`: `0 10px 15px -3px rgba(0,0,0,0.1)`
- Dark mode: increased opacity (0.3 / 0.4 / 0.5)

## 18. Animations

- `fadeIn`: 0.3s ease-out, translateY(10px→0)
- `slideIn`: 0.3s ease-out, translateX(-10px→0)
- Accordion: 0.2s ease-out
- Tab transitions: tween 0.2s easeOut
