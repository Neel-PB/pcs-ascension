

## Remove Cmd+K Shortcut and Simplify Search Placeholder

### Overview
Strip out the keyboard shortcut (Cmd+K) functionality and update the placeholder text to just say "Search..." instead of "Search... (⌘K)".

### Changes

#### `src/components/shell/GlobalSearchCommand.tsx`
1. **Remove the Cmd+K keyboard listener** (lines 32-42) -- delete the entire `useEffect` block that listens for `Cmd+K` / `Ctrl+K`
2. **Update placeholder text** (line 126) -- change from `"Search... (⌘K)"` to `"Search..."`
3. **Remove `inputRef`** (line 15) -- no longer needed since nothing programmatically focuses the input. Also remove `ref={inputRef}` from the SearchField (line 125)

### Files Changed
- `src/components/shell/GlobalSearchCommand.tsx` -- remove shortcut listener, simplify placeholder

