
# Multi-Select with Chips for Roles and Organization Access

## Overview

Transform the User Form to use chip-based multi-select UI for both Roles and Organization Access sections. This will provide a cleaner, more intuitive interface.

## Changes Required

### 1. Create Reusable MultiSelectChips Component

**New File:** `src/components/ui/multi-select-chips.tsx`

A reusable component that:
- Shows selected items as removable chips
- Provides a dropdown/popover with checkbox list to select items
- Shows "X" button on each chip to remove
- Compact display with wrap

```tsx
interface MultiSelectChipsProps {
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}
```

### 2. Update UserFormSheet.tsx - Roles Section

**Current:** Checkbox list with descriptions stacked vertically
**New:** Multi-select with chips showing selected roles

- Display selected roles as removable Badge chips
- Click "Add Role" button opens popover with checkbox list
- Each chip shows role label with X to remove
- System roles marked with lock icon

### 3. Update OrgAccessManager.tsx - Complete Redesign

**Current Structure:**
- Three collapsible sections (Markets, Facilities, Departments)
- Checkbox lists inside each section

**New Structure:**
Four sections (adding Region), each with:
- Label with icon
- Chips showing selected items (removable)
- "Add" button that opens a searchable popover
- Each level is flat/independent (no hierarchy)

```
Region
[chip: East] [chip: West] [+ Add Region]

Market  
[chip: Indiana] [chip: Michigan] [+ Add Market]

Facility
[chip: Hospital A] [chip: Hospital B] [+ Add Facility]

Department
[chip: ICU] [chip: ER] [+ Add Department]
```

### 4. Database Migration - Add Region Column

Add `region` column to `user_organization_access` table:

```sql
ALTER TABLE user_organization_access 
ADD COLUMN region text;
```

### 5. Update useUserOrgAccess Hook

Add region to the flat access structure:

```typescript
interface OrgAccessFlat {
  regions: string[];    // NEW
  markets: string[];
  facilities: Facility[];
  departments: Department[];
}
```

### 6. Update useOrgScopedFilters Hook

Add region filtering logic for users with region restrictions.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/multi-select-chips.tsx` | Reusable multi-select with chips component |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/UserFormSheet.tsx` | Replace checkbox list with MultiSelectChips for roles |
| `src/components/admin/OrgAccessManager.tsx` | Redesign with 4 chip sections (Region, Market, Facility, Department) |
| `src/hooks/useUserOrgAccess.ts` | Add regions to flat structure |
| `src/hooks/useOrgScopedFilters.ts` | Add region filtering logic |

## Database Changes

- Add `region` column to `user_organization_access` table

---

## UI Mockup

### Roles Section (New)
```
Roles
[Admin ×] [Labor Management ×]        [+ Add Role]
```

### Organization Access (New)
```
Organization Access

Region
[East ×] [West ×]                     [+ Add]

Market
[Indiana ×]                           [+ Add]

Facility
[Hospital A ×] [Hospital B ×]         [+ Add]

Department
(No restrictions)                     [+ Add]
```

---

## Technical Details

### MultiSelectChips Component Features

1. **Chip Display:**
   - Badge style chips with X button
   - Truncate long names with tooltip
   - Wrap to multiple lines if needed

2. **Add Popover:**
   - Search input for filtering long lists
   - Checkbox list of available options
   - Shows which items are already selected
   - Close on click outside

3. **Props:**
   - `options`: Available items to select
   - `selected`: Currently selected values
   - `onChange`: Callback when selection changes
   - `label`: Section label
   - `icon`: Optional icon component
   - `searchable`: Enable search for long lists (default true)
   - `placeholder`: Text when nothing selected
