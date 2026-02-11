

# Apply Helix Dropdown (aka Select) Design to Filter Components

## What Changes

Update the Select/Dropdown components and all three Position filter sheets to match the Helix design system's "Dropdown (aka Select)" pattern. Search inputs are preserved.

## Helix Dropdown Pattern (from the design system)

The key visual elements from the Helix spec:
- **Label**: Sits above the field (already in place)
- **Trigger**: Clean border with a bottom-border highlight on focus (instead of ring-based focus). Text is left-aligned with a chevron on the right
- **Chevron indicator**: Points down when closed, up when open -- indicates expand/collapse state
- **Dropdown menu**: Opens below with option items; selected item gets a subtle highlight (already using `bg-primary/15` pattern)
- **Helper text**: Optional descriptive text below the field
- **Focus state**: Uses a 2px primary-colored bottom border instead of the default ring

## Files to Update

### 1. `src/components/ui/select.tsx` -- Shared Select Component

**SelectTrigger changes:**
- Replace `focus:ring-2 focus:ring-ring focus:ring-offset-2` with a bottom-border focus style: `focus:ring-0 focus:border-b-2 focus:border-primary` to match Helix's underline focus
- Change border radius from `rounded-md` to `rounded-sm` (Helix uses subtler rounding)
- Update chevron: currently always shows `ChevronDown`. Instead, use `data-[state=open]` and `data-[state=closed]` CSS to rotate the chevron (Radix exposes this on the trigger). Add `transition-transform data-[state=open]:rotate-180` to the chevron icon

**SelectContent changes:**
- Update `rounded-md` to `rounded-sm` for consistency
- Add slightly more vertical padding to items (`py-2` instead of `py-1.5`) for better touch targets per Helix spacing

**SelectItem changes:**
- Keep the existing `bg-primary/15` selected highlight (matches Helix)
- Add `py-2` for taller item rows matching Helix specs

### 2. `src/components/positions/EmployeesFilterSheet.tsx`

- Add `htmlFor` attributes to Labels linking them to their respective Select triggers (accessibility per Helix)
- Add helper text beneath the "Job Family" search input: "Search by job family name"
- Add helper text beneath "FTE Range": "Enter values between 0 and 1"
- Keep all existing search Input fields unchanged

### 3. `src/components/positions/ContractorsFilterSheet.tsx`

- Same Label/helper-text updates as Employees
- Add helper text for "Job Family" and "FTE Range" fields

### 4. `src/components/positions/RequisitionsFilterSheet.tsx`

- Same Label/helper-text updates
- Add helper text for "Vacancy Age": "Number of days since position became vacant"
- Add helper text for "Job Family" search input

### 5. `src/components/ui/input.tsx`

- Update Input focus style to match: replace `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` with `focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary` for consistency with the Select trigger focus pattern

### 6. `src/components/ui/label.tsx`

- Add `text-muted-foreground` to the default label variant so labels appear in the subdued color that Helix uses for field labels (slightly lighter than body text)

## What Stays the Same

- All search/text Input fields remain (Job Family search, FTE range inputs, Vacancy Age inputs)
- The `bg-primary/15` selection highlight pattern is already Helix-compliant
- The Sheet-based filter panel layout is preserved
- No structural changes to filter logic or state management

## Technical Notes

- The chevron rotation uses Radix's built-in `data-[state=open]` attribute on `SelectPrimitive.Trigger`, so no additional state management is needed
- Helper text is implemented as a simple `<p className="text-xs text-muted-foreground">` below each field
- Total files to edit: **6**

