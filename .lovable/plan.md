

# Plan: Add Nursing/Non-Nursing Toggle to Planned/Active Resources

## Overview

Add a second toggle next to the existing Hired/Active toggle that allows users to filter between Nursing and Non-Nursing views. The toggle visibility and behavior depend on filter context.

---

## Database Changes

### Add `is_nursing` Column to `departments` Table

```sql
ALTER TABLE departments 
ADD COLUMN is_nursing BOOLEAN DEFAULT true;

-- Update existing departments based on known classification
-- (Will need a data migration or manual classification)
```

**Rationale:** Nursing/Non-Nursing is a property of the department, not individual positions. This allows filtering at the department level.

---

## UI Behavior Matrix

| Filter State | Toggle Behavior |
|--------------|-----------------|
| Region/Market/Facility selected (no department) | Show toggle, both options selectable |
| Specific Department selected + is_nursing = true | Toggle shows "Nursing" selected, disabled OR hidden |
| Specific Department selected + is_nursing = false | Toggle shows "Non-Nursing" selected, disabled OR hidden |

---

## Visual Design

### Toggle Placement

```text
┌──────────────────────────────────────────────────────────────────────┐
│  FTE Skill Shift Analysis   [Hired│Active]  [Nursing│Non-Nursing]   │
└──────────────────────────────────────────────────────────────────────┘
```

The new toggle uses the same styling as the existing Hired/Active toggle:
- Rounded container with `bg-background shadow-soft`
- Animated indicator using Framer Motion `layoutId`
- Tooltips explaining each mode

---

## Table Column Changes

### Nursing View (Default)
Shows all 4 column groups:

| Skills | Target FTEs | Hired FTEs | Open Req FTEs | Variance |
|--------|-------------|------------|---------------|----------|

### Non-Nursing View
Shows only 2 column groups:

| Skills | Hired FTEs | Open Req FTEs |
|--------|------------|---------------|

**Implementation:** Conditionally render column groups based on `staffCategory` state.

---

## Files to Modify

### 1. Database Migration
**Action:** Add `is_nursing` column to `departments` table

```sql
ALTER TABLE departments 
ADD COLUMN is_nursing BOOLEAN DEFAULT true;
```

### 2. `src/pages/staffing/PositionPlanning.tsx`

**Changes:**
- Add `staffCategory` state: `'nursing' | 'non-nursing'`
- Add new toggle component next to existing Hired/Active toggle
- Conditionally render Target FTEs and Variance columns based on `staffCategory`
- Receive `selectedDepartment` and department's `is_nursing` value as props
- Auto-set and disable toggle when specific department is selected

### 3. `src/pages/staffing/StaffingSummary.tsx`

**Changes:**
- Pass `selectedDepartment` value to `PositionPlanning` component
- Optionally fetch department's `is_nursing` status to pass down

### 4. `src/hooks/useDepartmentCategory.ts` (New File)

**Purpose:** Hook to determine if selected department is nursing or non-nursing

```typescript
export function useDepartmentCategory(departmentId: string | null) {
  // Query departments table for is_nursing field
  // Return: { isNursing: boolean | null, isLoading: boolean }
}
```

---

## Implementation Details

### Toggle Component Addition (PositionPlanning.tsx)

Add after the existing Hired/Active toggle (~line 755):

```tsx
{/* Nursing/Non-Nursing Toggle */}
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: 0.1 }}
>
  <div className="inline-flex items-center justify-center rounded-xl bg-background p-1 shadow-soft text-muted-foreground">
    <LayoutGroup>
      <div className="flex gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => !isDepartmentSelected && setStaffCategory('nursing')}
              disabled={isDepartmentSelected}
              className="relative inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none disabled:opacity-50"
            >
              {staffCategory === 'nursing' && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute inset-0 bg-gradient-primary rounded-md"
                />
              )}
              <span className={cn(
                "relative z-10 transition-colors",
                staffCategory === 'nursing' ? "text-white" : "text-muted-foreground"
              )}>
                Nursing
              </span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              <span className="font-semibold">Nursing:</span> Clinical departments with 
              Target FTEs, Hired, Open Reqs, and Variance analysis
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => !isDepartmentSelected && setStaffCategory('non-nursing')}
              disabled={isDepartmentSelected}
              className="relative inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none disabled:opacity-50"
            >
              {staffCategory === 'non-nursing' && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute inset-0 bg-gradient-primary rounded-md"
                />
              )}
              <span className={cn(
                "relative z-10 transition-colors",
                staffCategory === 'non-nursing' ? "text-white" : "text-muted-foreground"
              )}>
                Non-Nursing
              </span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              <span className="font-semibold">Non-Nursing:</span> Administrative/support 
              departments showing Hired and Open Reqs only
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </LayoutGroup>
  </div>
</motion.div>
```

### Conditional Column Rendering

```tsx
// In FTESkillShiftTable header
<TableHeader>
  <TableRow>
    <TableHead className="font-semibold">Skills</TableHead>
    
    {/* Target FTEs - only for Nursing */}
    {staffCategory === 'nursing' && (
      <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2">
        Target FTEs
      </TableHead>
    )}
    
    {/* Hired FTEs - always shown */}
    <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2">
      {viewMode === 'active' ? 'Active FTEs' : 'Hired FTEs'}
    </TableHead>
    
    {/* Open Req FTEs - always shown */}
    <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2">
      Open Req FTEs
    </TableHead>
    
    {/* Variance - only for Nursing */}
    {staffCategory === 'nursing' && (
      <TableHead colSpan={3} className="text-center font-semibold bg-muted/30 border-l-2">
        Variance
      </TableHead>
    )}
  </TableRow>
</TableHeader>
```

### Auto-Detection Logic

```tsx
// When department changes, auto-set category
useEffect(() => {
  if (selectedDepartment && selectedDepartment !== 'all-departments') {
    // departmentIsNursing comes from useDepartmentCategory hook
    setStaffCategory(departmentIsNursing ? 'nursing' : 'non-nursing');
  }
}, [selectedDepartment, departmentIsNursing]);

const isDepartmentSelected = selectedDepartment && selectedDepartment !== 'all-departments';
```

---

## Props Flow

```text
StaffingSummary
  ├── selectedDepartment state
  └── PositionPlanning
        ├── receives selectedDepartment prop
        ├── uses useDepartmentCategory(selectedDepartment)
        ├── manages staffCategory state
        └── conditionally renders columns
```

---

## Technical Summary

| Change | File | Description |
|--------|------|-------------|
| Database | Migration | Add `is_nursing` boolean to `departments` table |
| Hook | `useDepartmentCategory.ts` | Query department's nursing status |
| UI | `PositionPlanning.tsx` | Add toggle, conditional columns, auto-detection |
| Props | `StaffingSummary.tsx` | Pass `selectedDepartment` to `PositionPlanning` |

