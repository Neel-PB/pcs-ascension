

## Replace User Guides Search with Helix SearchField Component

### Problem

The User Guides tab inside the Support page uses a plain `Input` element with a manually positioned search icon and clear button. This doesn't match the standard Helix `SearchField` component used in the Positions module (Employees, Contractors, Requisitions tabs), which is pill-shaped with a blue circular search button and constant 2px border.

### Changes

**File: `src/components/support/UserGuidesTab.tsx`**

1. Replace `Input` import with `SearchField` import from `@/components/ui/search-field`
2. Remove the manual `Search` and `X` icon imports (SearchField handles them internally)
3. Replace the entire custom search block (lines 147-166) -- the `relative` div with the manually positioned icons and Input -- with a single `SearchField` component:
   - `placeholder="Search tours and steps..."`
   - `value={inputValue}`
   - `onChange` mapped to `setInputValue`
   - `onClear` mapped to clear the input
4. Remove unused `Search` and `X` icon imports if no longer needed elsewhere in the file

### Result

The User Guides search will use the same pill-shaped, blue-button `SearchField` as every Positions tab, matching Helix standards consistently across the app.

