

# Apply Helix Search Field Style Across the Application

## Summary

Update all search input fields to match the Helix Design System "Search Field" spec: pill-shaped (rounded-full), with a leading search icon on the left, a clear (X) button when text is present, and consistent padding/sizing.

## Helix Search Field Specs
- **Border Radius**: 32px (pill shape / `rounded-full`)
- **Border**: 1px stroke
- **Padding**: 16px left/right
- **Lead icon**: Search icon on the left inside the field
- **Clear button**: X icon appears on the right when text is entered, clears the field
- **No separate blue CTA button**: Since all our searches are "Search CTA: False" (filter-as-you-type), we do not need the blue circular search button on the right

## Approach

Create a reusable `SearchField` component that encapsulates the Helix pattern, then replace all inline search input implementations with it.

## Files to Create

### `src/components/ui/search-field.tsx` (NEW)
A reusable search input component with:
- Pill shape (`rounded-full`)
- Left search icon (16px padding)
- Right clear (X) button that appears only when input has a value
- Accepts standard input props (placeholder, value, onChange, className)
- Follows the existing `Input` component pattern with `forwardRef`

## Files to Edit

Replace the inline `<div className="relative"><Search .../><Input .../></div>` pattern in each of these files with the new `<SearchField />` component:

1. **`src/pages/positions/EmployeesTab.tsx`** -- Position module search
2. **`src/pages/positions/ContractorsTab.tsx`** -- Position module search
3. **`src/pages/positions/RequisitionsTab.tsx`** -- Position module search
4. **`src/components/shell/AppHeader.tsx`** -- Global header search trigger
5. **`src/pages/feedback/FeedbackPage.tsx`** -- Feedback search
6. **`src/pages/admin/UsersManagement.tsx`** -- Admin users search
7. **`src/components/admin/PermissionListView.tsx`** -- Permissions search
8. **`src/pages/admin/PermissionsManagement.tsx`** -- Permissions search
9. **`src/pages/support/SupportPage.tsx`** -- Support/FAQ search
10. **`src/components/ui/multi-select-chips.tsx`** -- Dropdown search (keep rectangular here since it's inside a popover)
11. **`src/components/admin/AccessScopeManager.tsx`** -- Dropdown search (keep rectangular here since it's inside a popover)

**Note**: Search inputs inside popover dropdowns (multi-select-chips, AccessScopeManager, FilterBar facility/department comboboxes) will remain rectangular as they are embedded within dropdown panels, not standalone search fields.

## Technical Details

### SearchField Component API
```tsx
interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}
```

### Styling
- `rounded-full` for pill shape
- `pl-10 pr-10` for icon spacing (left search icon + right clear button)
- `h-10` matching current input height
- Search icon: `h-4 w-4 text-muted-foreground` positioned absolutely left
- Clear button: `h-4 w-4` X icon, only visible when value is non-empty
- Border and focus styles inherit from the existing Input conventions (bottom border focus from Helix dropdown standard)

