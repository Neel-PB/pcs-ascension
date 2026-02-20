

## Align Support Page Search with Helix Standards

### Problem

The FAQs tab on the Support page uses a raw `useState` for search filtering instead of the standard `useDebouncedSearch` hook used across all other modules (Employees, Contractors, Requisitions, User Guides). While the `SearchField` component itself is visually Helix-compliant (pill-shaped, blue button, 2px border), the search behavior is inconsistent.

### Changes

**File: `src/pages/support/SupportPage.tsx`**

1. Import `useDebouncedSearch` from `@/hooks/useDebouncedSearch`
2. Replace the raw `useState` for `searchQuery` with the debounced hook:
   - `inputValue` for display in the SearchField
   - `debouncedValue` for actual FAQ filtering
   - `setInputValue` as the onChange handler
3. Update the `filteredFaqs` filter to use `debouncedValue` instead of `searchQuery`
4. Update the SearchField `value` and `onChange` to use `inputValue` / `setInputValue`

### Result

Search on the Support page will use the same debounced pattern as every other module, preventing unnecessary re-renders on each keystroke while keeping the input responsive.

