

# Remove Pending Badge & Auto-Open Calendar After Accept

## Summary of Requested Changes

1. **Remove "Pending" badge from Override Volume column** - Keep it only in Status column
2. **Auto-open expiration date calendar** - After user accepts override value, automatically open the date picker

---

## Visual Flow

```text
CURRENT:
┌────────────────────────────────────────────────────────────────────┐
│ Override Volume          │ Expiration Date   │ Status             │
├────────────────────────────────────────────────────────────────────┤
│ [Enter 24.5, click ✓]                                              │
│ 24.5 [Pending badge]     │ [Date picker]     │ Pending            │
└────────────────────────────────────────────────────────────────────┘

PROPOSED:
┌────────────────────────────────────────────────────────────────────┐
│ Override Volume          │ Expiration Date   │ Status             │
├────────────────────────────────────────────────────────────────────┤
│ [Enter 24.5, click ✓]                                              │
│ 24.5                     │ 📅 [auto-opens!]  │ Pending            │
└────────────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### File 1: `src/components/editable-table/cells/OverrideVolumeCell.tsx`

**Remove the Pending badge display (lines 211-216)**

```typescript
// BEFORE (lines 191-218)
{state === 'saved' && (
  <>
    <span className="text-sm font-medium">{value}</span>
    {!isPending && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ...>
            <RotateCcw ... />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Revert override</TooltipContent>
      </Tooltip>
    )}
    {/* REMOVE THIS SECTION */}
    {isPending && (
      <Badge variant="outline" className="ml-2 border-amber-500 text-amber-600 text-xs">
        Pending
      </Badge>
    )}
  </>
)}

// AFTER - Just remove the Pending badge block
{state === 'saved' && (
  <>
    <span className="text-sm font-medium">{value}</span>
    {!isPending && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ...>
            <RotateCcw ... />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Revert override</TooltipContent>
      </Tooltip>
    )}
  </>
)}
```

---

### File 2: `src/components/editable-table/cells/EditableDateCell.tsx`

**Add `autoOpen` prop to programmatically open the calendar**

```typescript
interface EditableDateCellProps {
  // ... existing props
  autoOpen?: boolean;        // NEW: Open calendar automatically when this becomes true
  onAutoOpenComplete?: () => void;  // NEW: Callback when auto-open is handled
}

export function EditableDateCell({
  // ... existing props
  autoOpen = false,
  onAutoOpenComplete,
}: EditableDateCellProps) {
  // ... existing state

  // NEW: Handle auto-open when prop changes to true
  useEffect(() => {
    if (autoOpen && !isOpen) {
      setIsOpen(true);
      onAutoOpenComplete?.();
    }
  }, [autoOpen]);

  // ... rest of component
}
```

---

### File 3: `src/pages/staffing/SettingsTab.tsx`

**Track which department should auto-open its date picker**

```typescript
// Add state to track which department should have its date picker opened
const [autoOpenDatePicker, setAutoOpenDatePicker] = useState<string | null>(null);

// Update handleSaveVolume to trigger auto-open
const handleSaveVolume = async (departmentId: string, volume: number | null) => {
  if (!canManageOverrides) return;
  if (!volume) return;

  // Store in pending state (memory)
  setPendingOverrides(prev => ({
    ...prev,
    [departmentId]: volume
  }));

  // NEW: Trigger auto-open for this department's date picker
  setAutoOpenDatePicker(departmentId);
};
```

---

### File 4: `src/config/volumeOverrideColumns.tsx`

**Pass auto-open props to EditableDateCell**

Update the column factory function signature:

```typescript
export const createVolumeOverrideColumns = (
  onSaveVolume: (departmentId: string, volume: number | null) => Promise<void>,
  onSaveDate: (departmentId: string, date: string | null) => Promise<void>,
  onDeleteOverride: (departmentId: string) => Promise<void>,
  config?: VolumeOverrideConfig,
  autoOpenDatePickerFor?: string | null,  // NEW: Department ID to auto-open
  onAutoOpenComplete?: () => void          // NEW: Clear auto-open after handling
): ColumnDef<VolumeOverrideRow>[] => [
  // ... columns
  {
    id: 'expiry_date',
    label: 'Expiration Date',
    // ...
    renderCell: (row) => {
      // ... existing logic
      return (
        <div className="relative px-3 py-2">
          <EditableDateCell
            value={row.expiry_date}
            originalValue={null}
            onSave={(value) => onSaveDate(row.department_id, value)}
            minDate={new Date()}
            maxDate={maxDate}
            autoOpen={autoOpenDatePickerFor === row.department_id}  // NEW
            onAutoOpenComplete={onAutoOpenComplete}                  // NEW
          />
          {/* ... existing warning icon */}
        </div>
      );
    },
  },
];
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/editable-table/cells/OverrideVolumeCell.tsx` | Remove Pending badge (lines 211-216) |
| `src/components/editable-table/cells/EditableDateCell.tsx` | Add `autoOpen` and `onAutoOpenComplete` props |
| `src/pages/staffing/SettingsTab.tsx` | Add `autoOpenDatePicker` state, trigger on volume accept |
| `src/config/volumeOverrideColumns.tsx` | Pass auto-open props through to EditableDateCell |

---

## Updated User Flow

| Step | Action | Result |
|------|--------|--------|
| 1 | Click pencil on Override Volume | Input field appears |
| 2 | Enter value (e.g., 24.5), click ✓ | Value stored in memory, **calendar opens automatically** |
| 3 | Select expiration date | Both volume AND date saved to database |
| 4 | After save | "Active" status, "Revert" button appears |

