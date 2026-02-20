

## Update `.lovable/plan.md` to a Comprehensive Helix Design System Reference

### Problem

The current `.lovable/plan.md` only contains a single past task. There is no centralized reference that maps common UI element names (search, button, card, table, select, icon, badge) to their actual Helix component imports and standard props. This means every time you say "add a search" or "add a card," the implementation may not use the correct Helix component or styling.

### Changes

**File: `.lovable/plan.md`**

Replace the entire file with a comprehensive Helix Design System Component Reference that covers:

**1. Search**
- Component: `SearchField` from `@/components/ui/search-field`
- Always pair with `useDebouncedSearch` hook from `@/hooks/useDebouncedSearch`
- Props: `value={inputValue}`, `onChange`, `onClear`
- Style: pill-shaped (`rounded-full`), constant `border-2`, blue circular search button, 2px focus border

**2. Button**
- Component: `Button` from `@/components/ui/button`
- Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `ascension` (pill-shaped primary)
- Sizes: `default` (h-10), `sm` (h-9), `lg` (h-11), `icon` (h-10 w-10 rounded-full, 24px icon), `icon-lg` (h-12 w-12)

**3. Card**
- Component: `Card`, `CardHeader`, `CardContent`, `CardFooter` from `@/components/ui/card`
- Style: `rounded-xl`, `shadow-md`, `px-4` padding (not p-6)
- Standard layout classes: `h-full flex flex-col gap-4 overflow-hidden` for page-level wrappers

**4. Table**
- Component: `EditableTable` from `@/components/editable-table/EditableTable` for data tables
- Primitive: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
- Rows use alternating `muted/30` zebra striping via TableBody

**5. Select**
- Component: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` from `@/components/ui/select`
- Trigger style: `rounded-lg`, `border-2 border-input`, `px-4 py-3`, blue brand chevron (`text-[#1D69D2]`) that rotates 180 degrees when open
- Content: `min-w-[210px]`, `rounded-lg`
- Selected item: `bg-primary/15` + `border-primary/30` (no checkmarks)

**6. Badge**
- Component: `Badge` from `@/components/ui/badge`
- Shape: `rounded-full` (pill)
- Variants: `default`, `secondary`, `destructive`, `success`, `warning`, `outline`

**7. Icons**
- All icons imported from `@/lib/icons` (never from `lucide-react` or `react-icons` directly)
- Standard size: 24px (`size-6` / `h-6 w-6`) for navigation/header; 14-16px for table action icons
- Uses Material Design icons re-exported with Lucide-compatible names
- Type: `IconType` from `react-icons`

**8. Layout Standards**
- Page wrapper: `h-full flex flex-col gap-4 overflow-hidden`
- Fixed elements: `flex-shrink-0`
- Scrollable content: `min-h-0 max-h-full overflow-auto`
- Standard gap: `gap-4` (16px), never `space-y-6`

### Result

Every future prompt referencing "search," "button," "card," "table," "select," "badge," or "icon" will automatically resolve to the correct Helix component with the correct import path, props, and styling -- no manual correction needed.

