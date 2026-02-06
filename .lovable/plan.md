
# Override Settings - Improved Save Workflow

## Summary of Requested Changes

1. **Save override volume first** - Allow saving override volume without requiring expiry date upfront
2. **Then add expiry date** - After volume is saved, enable the expiry date field to be filled
3. **After save, show "Revert" only** - Replace Edit (pencil) + Delete (trash) buttons with a single "Revert" button
4. **Use override in Summary** - Ensure saved overrides are reflected in the Summary tab's Volume KPIs

---

## Current vs. Proposed Workflow

```text
CURRENT (Broken):
┌─────────────────────────────────────────────────────────────────┐
│ Override Volume    │ Expiration Date   │ Status                │
├─────────────────────────────────────────────────────────────────┤
│ [Edit] —           │ Set override first│ Not Set               │
│                    │ (disabled)        │                       │
│ ↓ Click edit, enter value, click ✓                             │
│ BLOCKED! Requires expiry date to save (silent fail)            │
└─────────────────────────────────────────────────────────────────┘

PROPOSED (Fixed):
┌─────────────────────────────────────────────────────────────────┐
│ Override Volume    │ Expiration Date   │ Status                │
├─────────────────────────────────────────────────────────────────┤
│ [Edit] —           │ Set override first│ Not Set               │
│ ↓ Step 1: Enter override value, click ✓                        │
│ 24.5 [Revert]      │ [Set Date]        │ Incomplete            │
│ ↓ Step 2: Set expiration date                                  │
│ 24.5 [Revert]      │ Mar 15, 2026      │ Active                │
│ ↓ Revert clears both volume and date                           │
│ [Edit] —           │ Set override first│ Not Set               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### File 1: `src/pages/staffing/SettingsTab.tsx`

**Change 1: Update `handleSaveVolume` to save without requiring expiry date**

Remove the check that blocks saving when no expiry date exists. Use a default expiry date for initial save:

```typescript
const handleSaveVolume = async (departmentId: string, volume: number | null) => {
  if (!canManageOverrides) return;
  
  const row = tableData.find((r) => r.department_id === departmentId);
  if (!row) return;

  if (!volume) return;

  // Calculate default expiry date if not set (e.g., 30 days from now or fiscal year end)
  const defaultExpiry = row.expiry_date || 
    (row.max_allowed_expiry_date 
      ? new Date(row.max_allowed_expiry_date).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  await upsertMutation.mutateAsync({
    market: row.market,
    facility_id: row.facility_id,
    facility_name: row.facility_name,
    department_id: row.department_id,
    department_name: row.department_name,
    override_volume: volume,
    expiry_date: defaultExpiry,
  });
};
```

---

### File 2: `src/components/editable-table/cells/OverrideVolumeCell.tsx`

**Change: Replace Edit + Delete with single "Revert" button in saved state**

Update the saved state UI from:
```
[value] [Edit pencil] [Delete trash]
```

To:
```
[value] [Revert rotate-ccw]
```

```typescript
// In the 'saved' state section (lines 186-218)
{state === 'saved' && (
  <>
    <span className="text-sm font-medium">{value}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
          onClick={handleDelete}
          disabled={isLoading}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Revert override</TooltipContent>
    </Tooltip>
  </>
)}
```

**Add import for RotateCcw icon:**
```typescript
import { Pencil, Check, X, RotateCcw } from 'lucide-react';
```

---

### File 3: `src/config/volumeOverrideColumns.tsx`

**Optional: Add "Incomplete" status for overrides without expiry dates**

Update the Status column to show "Incomplete" when volume exists but date is still pending:

```typescript
// In status column renderCell
if (row.override_volume && !row.expiry_date) {
  return (
    <div className="px-3 py-2">
      <Badge variant="outline" className="border-amber-500 text-amber-600">
        Incomplete
      </Badge>
    </div>
  );
}
```

---

## Summary Table Uses Override

The Summary tab already displays "Override Vol" as a KPI card (line 358-372 in StaffingSummary.tsx). To connect this to actual database values, the following would need to be added in future:

1. Fetch volume overrides in Summary based on selected facility/department
2. Replace the hardcoded `value: "24.7"` with actual override value from database
3. Show "—" or "Not Set" when no override exists

This is currently using mock data but the infrastructure is in place.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/staffing/SettingsTab.tsx` | Remove expiry date requirement when saving volume; use default expiry |
| `src/components/editable-table/cells/OverrideVolumeCell.tsx` | Replace Edit + Delete buttons with single "Revert" button |
| `src/config/volumeOverrideColumns.tsx` | (Optional) Add "Incomplete" status badge |

---

## User Flow After Changes

1. User clicks pencil icon on Override Volume
2. User enters override value (e.g., 24.5)
3. User clicks Accept (✓)
4. Value saves immediately with auto-calculated expiry date
5. Expiration Date field becomes enabled
6. User can adjust the expiration date if needed
7. A single "Revert" button appears next to the saved value
8. Clicking "Revert" clears both the volume and date, returning to idle state
