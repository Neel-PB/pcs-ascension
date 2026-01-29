

# Enhanced Active FTE Form with Status-Based Business Rules

## Overview

Transform the Active FTE edit popover from a freeform text input to a structured form with dropdown-based status selection, FTE value constraints, and dynamic expiry date limits based on business rules.

---

## Business Rules Summary

| Status | FTE Range | Max Expiry Duration |
|--------|-----------|---------------------|
| LOA | 0 to original FTE | 12 months |
| FMLA | 0 to original FTE | 12 months |
| Intermittent FMLA | 0 to original FTE | 12 months |
| Military Leave | 0 to original FTE | 12 months |
| Voluntary Separation | 0 to original FTE | 1 month |
| Involuntary Separation | 0 to original FTE | 1 month |
| Orientation | 0 to original FTE | 6 months |
| PRNs (PRN only) | 0.2 to 1.0 | 6 months |
| Shared Position | Non-zero values | No date limit, requires additional shared position details |

---

## Expiry Date Calculation Logic

**Key Rule**: Months are calculated from the **1st of the current month**, and the max expiry is the **last day of the target month**.

### Calculation Formula

```text
Current Date: January 29, 2026

1 Month Max (Voluntary/Involuntary Separation):
   Start: January 1, 2026
   Add 1 month → February 1, 2026
   Max Date = Last day of January = January 31, 2026

6 Month Max (Orientation, PRNs):
   Start: January 1, 2026
   Add 6 months → July 1, 2026
   Max Date = Last day of June = June 30, 2026

12 Month Max (LOA, FMLA, Military Leave):
   Start: January 1, 2026
   Add 12 months → January 1, 2027
   Max Date = Last day of December 2026 = December 31, 2026
```

### Implementation

```typescript
import { startOfMonth, addMonths, endOfMonth, subDays } from 'date-fns';

export function getMaxExpiryDate(statusValue: string): Date | null {
  const status = FTE_STATUS_OPTIONS.find(s => s.value === statusValue);
  if (!status || status.maxMonths === null) return null;
  
  const today = new Date();
  
  // Start from 1st of current month
  const monthStart = startOfMonth(today);
  
  // Add the max months
  const targetMonthStart = addMonths(monthStart, status.maxMonths);
  
  // Get the last day of the month BEFORE the target month
  // (because "within X months" means up to but not exceeding)
  const maxDate = endOfMonth(subDays(targetMonthStart, 1));
  
  return maxDate;
}
```

### Examples Table

| Status Selected | Today | Max Months | Calculation | Max Expiry Date |
|-----------------|-------|------------|-------------|-----------------|
| Voluntary Separation | Jan 29 | 1 | Jan 1 + 1 month = Feb 1 → end of Jan | **Jan 31** |
| Voluntary Separation | Feb 15 | 1 | Feb 1 + 1 month = Mar 1 → end of Feb | **Feb 28** |
| Orientation | Jan 29 | 6 | Jan 1 + 6 months = Jul 1 → end of Jun | **Jun 30** |
| LOA | Jan 29 | 12 | Jan 1 + 12 months = Jan 1, 2027 → end of Dec 2026 | **Dec 31, 2026** |
| FMLA | Mar 15 | 12 | Mar 1 + 12 months = Mar 1, 2027 → end of Feb 2027 | **Feb 28, 2027** |
| Shared Position | Any | null | No limit | No max constraint |

---

## UI Flow

```text
1. User clicks Active FTE cell
   └── Popover opens with form

2. Status/Reason dropdown (required first step)
   └── Options: LOA, FMLA, Intermittent FMLA, Military Leave,
       Voluntary Separation, Involuntary Separation, Orientation,
       PRNs (conditionally shown for PRN employees only), Shared Position

3. Once status selected:
   └── Active FTE dropdown appears (0.0, 0.1, 0.2 ... 1.0)
       └── Values constrained based on status rules

4. Expiry Date picker appears
   └── Calendar shows dates from today to max expiry (calculated per rules)
   └── Dates outside range are disabled/grayed out

5. IF "Shared Position" selected:
   └── Additional fields appear:
       - Shared With (text field for department/facility info)
       - Shared FTE (the portion shared)
       - Shared Expiry (when the sharing arrangement ends - no date limit)

6. Save button validates and persists
```

---

## Files to Create/Modify

### 1. Create FTE Status Constants File

**New File: `src/lib/fteStatusRules.ts`**

```typescript
import { startOfMonth, addMonths, endOfMonth, subDays } from 'date-fns';

export interface FteStatusOption {
  value: string;
  label: string;
  maxMonths: number | null; // null = no limit
  requiresPRNStatus?: boolean;
  minFte?: number;
}

export const FTE_STATUS_OPTIONS: FteStatusOption[] = [
  { value: 'LOA', label: 'LOA (Leave of Absence)', maxMonths: 12 },
  { value: 'FMLA', label: 'FMLA', maxMonths: 12 },
  { value: 'INTERMITTENT_FMLA', label: 'Intermittent FMLA', maxMonths: 12 },
  { value: 'MILITARY_LEAVE', label: 'Military Leave', maxMonths: 12 },
  { value: 'VOLUNTARY_SEPARATION', label: 'Voluntary Separation', maxMonths: 1 },
  { value: 'INVOLUNTARY_SEPARATION', label: 'Involuntary Separation', maxMonths: 1 },
  { value: 'ORIENTATION', label: 'Orientation', maxMonths: 6 },
  { value: 'PRN', label: 'PRNs', maxMonths: 6, requiresPRNStatus: true, minFte: 0.2 },
  { value: 'SHARED_POSITION', label: 'Shared Position', maxMonths: null },
];

// FTE dropdown values: 0.0 to 1.0 in 0.1 increments
export const FTE_VALUES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

/**
 * Calculate max expiry date based on status rules.
 * Months start from 1st of current month.
 * Max date is the last day of the month before the target.
 */
export function getMaxExpiryDate(statusValue: string): Date | null {
  const status = FTE_STATUS_OPTIONS.find(s => s.value === statusValue);
  if (!status || status.maxMonths === null) return null;
  
  const today = new Date();
  const monthStart = startOfMonth(today);
  const targetMonthStart = addMonths(monthStart, status.maxMonths);
  const maxDate = endOfMonth(subDays(targetMonthStart, 1));
  
  return maxDate;
}

/**
 * Get allowed FTE values based on status and original FTE.
 */
export function getFteValuesForStatus(
  statusValue: string, 
  originalFte: number | null | undefined
): number[] {
  const status = FTE_STATUS_OPTIONS.find(s => s.value === statusValue);
  const maxFte = originalFte ?? 1.0;
  
  if (status?.value === 'PRN') {
    // PRN: 0.2 to 1.0
    return FTE_VALUES.filter(v => v >= 0.2 && v <= 1.0);
  }
  
  if (status?.value === 'SHARED_POSITION') {
    // Shared Position: anything other than zero
    return FTE_VALUES.filter(v => v > 0 && v <= maxFte);
  }
  
  // All others: 0 to original FTE
  return FTE_VALUES.filter(v => v <= maxFte);
}
```

### 2. Update EditableFTECell Component

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

Major changes:
- Add `employmentType` prop to conditionally show PRN option
- Replace freeform textarea with Select dropdown for status
- Replace freeform number input with Select dropdown for FTE
- Add dynamic expiry date constraints based on selected status
- Add conditional "Shared Position" additional fields section
- Show calculated max expiry date as helper text

```typescript
interface EditableFTECellProps {
  value: number | null | undefined;
  originalValue?: number | null | undefined;
  expiryDate?: string | null;
  status?: string | null;
  employmentType?: string | null; // NEW: to show/hide PRN option
  sharedWith?: string | null;     // NEW: for shared position
  sharedFte?: number | null;      // NEW: for shared position
  sharedExpiry?: string | null;   // NEW: for shared position
  onSave: (data: {
    actual_fte: number | null;
    actual_fte_expiry: string | null;
    actual_fte_status: string | null;
    actual_fte_shared_with?: string | null;
    actual_fte_shared_fte?: number | null;
    actual_fte_shared_expiry?: string | null;
  }) => void | Promise<void>;
  className?: string;
}
```

**Form Layout:**

```
┌─────────────────────────────────────┐
│ Status / Reason                     │
│ ┌─────────────────────────────────┐ │
│ │ Select reason... ▼              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Active FTE                          │
│ ┌─────────────────────────────────┐ │
│ │ 0.5 ▼                           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Expiry Date (max: Jan 31, 2026)     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Jan 15, 2026                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────────────────────────── │
│ (If Shared Position selected)       │
│                                     │
│ Shared With                         │
│ ┌─────────────────────────────────┐ │
│ │ ICU - Building A                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Shared FTE                          │
│ ┌─────────────────────────────────┐ │
│ │ 0.3 ▼                           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Shared Expiry Date                  │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Jun 30, 2026                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│     [Revert]          [Save]        │
└─────────────────────────────────────┘
```

### 3. Update EmployeesTab.tsx

**File: `src/pages/positions/EmployeesTab.tsx`**

Pass `employmentType` and shared position fields to EditableFTECell:

```typescript
<EditableFTECell
  value={row.actual_fte}
  originalValue={row.FTE}
  expiryDate={row.actual_fte_expiry}
  status={row.actual_fte_status}
  employmentType={row.employmentType}
  sharedWith={row.actual_fte_shared_with}
  sharedFte={row.actual_fte_shared_fte}
  sharedExpiry={row.actual_fte_shared_expiry}
  onSave={(data) => handleActualFteUpdate(...)}
/>
```

### 4. Update ContractorsTab.tsx

**File: `src/pages/positions/ContractorsTab.tsx`**

Same changes as EmployeesTab.

### 5. Database Migration

Add columns for shared position data:

```sql
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS actual_fte_shared_with TEXT,
ADD COLUMN IF NOT EXISTS actual_fte_shared_fte NUMERIC,
ADD COLUMN IF NOT EXISTS actual_fte_shared_expiry DATE;

COMMENT ON COLUMN positions.actual_fte_shared_with IS 'Department/facility the position is shared with';
COMMENT ON COLUMN positions.actual_fte_shared_fte IS 'FTE portion allocated to the shared arrangement';
COMMENT ON COLUMN positions.actual_fte_shared_expiry IS 'When the sharing arrangement ends';
```

### 6. Update useUpdateActualFte Hook

**File: `src/hooks/useUpdateActualFte.ts`**

Add shared position fields to the mutation:

```typescript
interface UpdateActualFteParams {
  id: string;
  actual_fte: number | null;
  actual_fte_expiry?: string | null;
  actual_fte_status?: string | null;
  actual_fte_shared_with?: string | null;
  actual_fte_shared_fte?: number | null;
  actual_fte_shared_expiry?: string | null;
  // Previous values for activity logging
  previousFte?: number | null;
  previousExpiry?: string | null;
  previousStatus?: string | null;
}
```

---

## Summary of Changes

| File | Type | Description |
|------|------|-------------|
| `src/lib/fteStatusRules.ts` | CREATE | Status options, FTE values, expiry calculation logic |
| `src/components/editable-table/cells/EditableFTECell.tsx` | UPDATE | Structured form with dropdowns & shared position fields |
| `src/pages/positions/EmployeesTab.tsx` | UPDATE | Pass employmentType and shared fields to cell |
| `src/pages/positions/ContractorsTab.tsx` | UPDATE | Pass employmentType and shared fields to cell |
| `src/hooks/useUpdateActualFte.ts` | UPDATE | Handle shared position fields |
| Database Migration | CREATE | Add shared position columns |

