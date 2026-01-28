
# Fix Column Headers Truncation in Positions Module

## Problem Identified

From the screenshot, the column headers are being truncated:
- "NA..." → should be "NAME"
- "POSITIO..." → should be "POSITION #"
- "STAT..." → should be "STATUS"
- "STAFF TY..." → should be "STAFF TYPE"
- "FULL/PA..." → should be "FULL/PART TIME"

## Root Cause Analysis

The `DraggableColumnHeader` component has a `truncate` class on the header label span (line 102):

```tsx
<span className="truncate flex-1 min-w-0 text-left">
```

This forces text truncation when space is limited. The header contains:
- Left padding: 16px (px-4)
- Drag handle space: ~20px (absolute positioned, but reserves visual space)
- Label text: variable
- Tooltip icon: ~16px (when present)
- Sort icon: ~16px (when sorted)
- Dropdown menu trigger: ~20px
- Right padding: 16px (px-4)
- Gap between elements: ~8px (gap-2)

**Total fixed overhead: ~100-120px**

For a column like "Staff Type" with width 160px, that leaves only ~40-60px for the label text - not enough!

## Solution

### Approach: Increase Column minWidth Values

Rather than remove truncation (which could cause layout issues), we need to ensure the `minWidth` values are large enough to display the full header text WITH all the icons.

**Header text widths needed (uppercase, 11px font):**
| Header | Text Width | + Icons/Padding | Minimum Width |
|--------|-----------|-----------------|---------------|
| CONTRACTOR NAME | ~120px | +100px | 220px |
| POSITION # | ~80px | +100px | 180px |
| JOB TITLE | ~65px | +100px | 165px |
| JOB FAMILY | ~75px | +100px | 175px |
| HIRED FTE | ~65px | +100px | 165px |
| ACTIVE FTE | ~75px | +100px | 175px |
| SHIFT | ~40px | +100px | 140px |
| STATUS | ~50px | +100px | 150px |
| STAFF TYPE | ~75px | +100px | 175px |
| FULL/PART TIME | ~105px | +100px | 205px |

### Files to Modify

1. **`src/config/employeeColumns.tsx`**
2. **`src/config/contractorColumns.tsx`**
3. **`src/config/requisitionColumns.tsx`**
4. **`src/stores/useColumnStore.ts`** - Increment version to reset persisted widths

### Detailed Changes

**Employee Columns:**
| Column | Current Width | Current minWidth | New Width | New minWidth |
|--------|--------------|------------------|-----------|--------------|
| Employee Name | 220 | 180 | 240 | 220 |
| Position # | 140 | 120 | 160 | 150 |
| Job Title | 240 | 180 | 240 | 200 |
| Job Family | 200 | 150 | 200 | 180 |
| Hired FTE | 100 | 80 | 120 | 110 |
| Active FTE | 100 | 80 | 120 | 110 |
| Shift | 180 | 160 | 180 | 160 |
| Status | 120 | 100 | 140 | 130 |
| Staff Type | 160 | 130 | 180 | 170 |
| Full/Part Time | 140 | 120 | 180 | 170 |

**Contractor Columns:** Same adjustments

**Requisition Columns:**
| Column | Current Width | Current minWidth | New Width | New minWidth |
|--------|--------------|------------------|-----------|--------------|
| Position # | 140 | 120 | 160 | 150 |
| Position Lifecycle | 180 | 160 | 200 | 190 |
| Vacancy Age | 160 | 140 | 180 | 170 |
| Job Title | 240 | 180 | 240 | 200 |
| Job Family | 200 | 150 | 200 | 180 |
| Shift | 180 | 160 | 180 | 160 |
| Employment Type | 160 | 140 | 180 | 170 |

**Store Version Update:**
```tsx
// Increment from 2 to 3 to reset persisted column widths
version: 3
```

## Visual Result

```text
BEFORE:
┌────────┬─────────┬────────┬─────────┬────────┐
│ NA...  │POSITIO..│STAT... │STAFF TY.│FULL/PA.│
└────────┴─────────┴────────┴─────────┴────────┘

AFTER:
┌──────────────┬────────────┬────────┬────────────┬───────────────┐
│ NAME         │ POSITION # │ STATUS │ STAFF TYPE │ FULL/PART TIME│
└──────────────┴────────────┴────────┴────────────┴───────────────┘
```

## Technical Notes

- The table uses proportional scaling when container is wider than total column widths
- Tooltips still work as fallback for any edge-case content that might exceed column width
- Persisted user preferences will be reset due to version increment
- Header text is always uppercase (via CSS `uppercase` class)
