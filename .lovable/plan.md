# Helix Design System – Component Reference

Every future prompt referencing these UI elements MUST use the components, imports, and styling defined below.

---

## 1. Search

- **Component:** `SearchField` from `@/components/ui/search-field`
- **Hook:** Always pair with `useDebouncedSearch` from `@/hooks/useDebouncedSearch`
- **Props:** `value={inputValue}`, `onChange={(e) => setInputValue(e.target.value)}`, `onClear={() => setInputValue("")}`
- **Style:** pill-shaped (`rounded-full`), constant `border-2`, blue circular search button, 2px focus border

---

## 2. Button

- **Component:** `Button` from `@/components/ui/button`
- **Variants:** `default` | `destructive` | `outline` | `secondary` | `ghost` | `link` | `ascension` (pill-shaped primary)
- **Sizes:** `default` (h-10) | `sm` (h-9) | `lg` (h-11) | `icon` (h-10 w-10 rounded-full, 24px icon) | `icon-lg` (h-12 w-12)

---

## 3. Card

- **Component:** `Card`, `CardHeader`, `CardContent`, `CardFooter` from `@/components/ui/card`
- **Style:** `rounded-xl`, `shadow-md`, `px-4` padding (never `p-6`)
- **Page wrapper:** `h-full flex flex-col gap-4 overflow-hidden`

---

## 4. Table

- **Data tables:** `EditableTable` from `@/components/editable-table/EditableTable`
- **Primitives:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
- **Zebra striping:** alternating `muted/30` applied via `TableBody`

---

## 5. Select

- **Component:** `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` from `@/components/ui/select`
- **Trigger:** `rounded-lg`, `border-2 border-input`, `px-4 py-3`, blue brand chevron (`text-[#1D69D2]`) rotates 180° when open
- **Content:** `min-w-[210px]`, `rounded-lg`
- **Selected item:** `bg-primary/15` + `border-primary/30` (no checkmarks)

---

## 6. Badge

- **Component:** `Badge` from `@/components/ui/badge`
- **Shape:** `rounded-full` (pill)
- **Variants:** `default` | `secondary` | `destructive` | `success` | `warning` | `outline`

---

## 7. Icons

- **Import:** ALL icons from `@/lib/icons` (never `lucide-react` or `react-icons` directly)
- **Type:** `IconType` from `react-icons`
- **Sizes:** 24px (`size-6` / `h-6 w-6`) for nav/header; 14–16px for table actions
- **Source:** Material Design icons re-exported with Lucide-compatible names

---

## 8. Layout Standards

- **Page wrapper:** `h-full flex flex-col gap-4 overflow-hidden`
- **Fixed elements:** `flex-shrink-0`
- **Scrollable content:** `min-h-0 max-h-full overflow-auto`
- **Standard gap:** `gap-4` (16px), never `space-y-6`
