

## Inline Header Search -- Remove Dialog, Use Dropdown

### Overview
Replace the current popup/dialog-based search with an inline search that lives directly in the header. When the user types in the header's SearchField, a dropdown panel appears below it showing categorized results -- no modal overlay, no dialog.

### Changes

#### 1. `src/components/shell/GlobalSearchCommand.tsx` -- Major rewrite to inline dropdown
- Remove `CommandDialog` wrapper entirely (no more modal/popup)
- Convert to a self-contained component that includes:
  - The SearchField input directly (not read-only anymore)
  - A dropdown results panel (absolute-positioned div below the input) that appears when there are results or the user is typing
  - Keep all 4 entity queries (Employees, Contractors, Requisitions, Feedback) as-is
- The dropdown closes when clicking outside (use a ref + click-outside listener)
- Cmd+K shortcut focuses the input instead of opening a dialog
- Results are rendered as simple styled list items grouped by category (no cmdk Command components needed)

#### 2. `src/components/shell/AppHeader.tsx` -- Simplify search section
- Remove the `commandOpen` state and the `onClick` wrapper around SearchField
- Remove the `GlobalSearchCommand` import as a separate dialog component
- Instead, render the new inline `GlobalSearchCommand` component directly in the center section, which contains both the input and the dropdown
- Keep the Cmd+K keyboard shortcut but redirect it to focus the search input

### Technical Approach
- The inline search component will manage its own input state and dropdown visibility
- Use `useRef` for the container + `useEffect` for click-outside detection to close the dropdown
- Use a `Popover`-like absolute positioned div (not Radix Popover -- just CSS) below the search field for results
- Keep the existing `useDebouncedSearch` hook and all Supabase queries unchanged
- Loading spinner, empty state, and "Type 2+ characters" hint render inside the dropdown

### Result Display
- Grouped sections with small headings (Employees, Contractors, Requisitions, Feedback)
- Each result is a clickable row that navigates to the relevant page
- Icons + text formatting stay the same as current implementation
- Dropdown has max-height with scroll, rounded corners, and shadow

### Files Changed
- `src/components/shell/GlobalSearchCommand.tsx` -- rewrite from dialog to inline dropdown
- `src/components/shell/AppHeader.tsx` -- remove dialog state, use inline component directly
