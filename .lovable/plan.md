

## Add Rounded Corners to Dropdown and Select Menus

### Problem
The Select and Dropdown Menu content panels currently use `rounded-sm` (small border radius). The user wants visibly rounded corners on these dropdown containers.

### Changes

**File: `src/components/ui/select.tsx`**
- `SelectContent`: Change `rounded-sm` to `rounded-lg` (8px rounded corners on the dropdown panel)

**File: `src/components/ui/dropdown-menu.tsx`**
- `DropdownMenuContent`: Change `rounded-sm` to `rounded-lg`
- `DropdownMenuSubContent`: Change `rounded-sm` to `rounded-lg`

### What stays the same
- Individual menu items remain flush/rectangular (per Helix spec)
- Select trigger stays `rounded-sm` (per filter-trigger-consistency rule)
- All padding, spacing, colors unchanged

### Impact
Global -- every Select and DropdownMenu across the app will automatically get rounded corners since these are the shared UI primitives.

