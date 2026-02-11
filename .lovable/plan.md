

# Fix Chevron Rotation for Facility and Department Filters

## Problem

Region and Market use the `Select` component, which exposes `data-[state=open]` on the trigger -- allowing CSS-based chevron rotation. Facility and Department use a `Popover + Button` (combobox) pattern, so the chevron has no open/closed state to rotate against.

## Solution

Use the existing `facilityOpen` and `departmentOpen` state variables to conditionally apply the `rotate-180` class to each chevron icon.

## File to Edit

**`src/components/staffing/FilterBar.tsx`**

1. **Facility chevron** (around line 362): Change from static to rotation-aware:
   ```tsx
   // Before
   <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#1D69D2]" />
   
   // After
   <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-[#1D69D2] transition-transform duration-200 ${facilityOpen ? 'rotate-180' : ''}`} />
   ```

2. **Department chevron** (similar pattern further down): Apply the same fix using `departmentOpen` state.

No new state or dependencies needed -- both `facilityOpen` and `departmentOpen` already exist in the component.

