

# Staged Override Save Workflow

## Summary of Requested Changes

The current implementation saves the override volume to the database immediately when the user clicks Accept. You want a **two-step staged workflow** where:

1. **Step 1: Accept Override Volume** → Store in memory (not DB), show "Pending" badge, enable date picker
2. **Step 2: Set Expiration Date** → NOW save both volume AND date to database together
3. **After full save** → Show only "Revert" button

---

## Visual Flow

```text
CURRENT (Saves immediately):
┌─────────────────────────────────────────────────────────────────┐
│ Override Volume    │ Expiration Date   │ Status                │
├─────────────────────────────────────────────────────────────────┤
│ [—] [Pencil]       │ Set override first│ Not Set               │
│ ↓ Enter 24.5, click ✓                                          │
│ SAVES TO DATABASE IMMEDIATELY (with default expiry)            │
│ 24.5 [Revert]      │ Mar 15, 2026      │ Active                │
└─────────────────────────────────────────────────────────────────┘

PROPOSED (Staged save):
┌─────────────────────────────────────────────────────────────────┐
│ Override Volume    │ Expiration Date   │ Status                │
├─────────────────────────────────────────────────────────────────┤
│ [—] [Pencil]       │ Set override first│ Not Set               │
│ ↓ Step 1: Enter 24.5, click ✓                                  │
│ 24.5 [Pending]     │ [Set Date ▼]      │ Pending               │ ← In memory only
│ ↓ Step 2: Select expiration date                               │
│ SAVES TO DATABASE (both volume + date together)                │
│ 24.5 [Revert]      │ Mar 15, 2026      │ Active                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### Approach: Use Local State in SettingsTab

Instead of modifying the cell component, we'll manage "pending" state at the table level in `SettingsTab.tsx`. This allows us to:
- Track pending volumes per department
- Conditionally enable the date picker
- Save both values together when date is selected

---

### File 1: `src/pages/staffing/SettingsTab.tsx`

**Change 1: Add pending state to track unsaved overrides**

```typescript
// Add state for pending (unsaved) override volumes
const [pendingOverrides, setPendingOverrides] = useState<Record<string, number>>({});
```

**Change 2: Update tableData to merge pending values**

```typescript
const tableData = useMemo((): VolumeOverrideRow[] => {
  // ... existing logic
  return departments.map((dept) => {
    const override = overrides.find((o) => o.department_id === dept.department_id);
    const pendingVolume = pendingOverrides[dept.department_id];
    
    return {
      // ... existing fields
      override_volume: override?.override_volume || null,
      pending_volume: pendingVolume ?? null, // NEW: Track pending value
      // ...
    };
  });
}, [departments, overrides, pendingOverrides, ...]);
```

**Change 3: Update handleSaveVolume to store in memory only**

```typescript
const handleSaveVolume = async (departmentId: string, volume: number | null) => {
  if (!canManageOverrides) return;
  if (!volume) return;

  // Store in pending state (memory) - don't save to DB yet
  setPendingOverrides(prev => ({
    ...prev,
    [departmentId]: volume
  }));
};
```

**Change 4: Update handleSaveDate to save both values together**

```typescript
const handleSaveDate = async (departmentId: string, date: string | null) => {
  if (!canManageOverrides) return;
  if (!date) return;

  const row = tableData.find((r) => r.department_id === departmentId);
  if (!row) return;

  // Get volume from pending state or existing override
  const volumeToSave = pendingOverrides[departmentId] ?? row.override_volume;
  if (!volumeToSave) return;

  // NOW save both to database
  await upsertMutation.mutateAsync({
    market: row.market,
    facility_id: row.facility_id,
    facility_name: row.facility_name,
    department_id: row.department_id,
    department_name: row.department_name,
    override_volume: volumeToSave,
    expiry_date: date,
  });

  // Clear from pending state
  setPendingOverrides(prev => {
    const updated = { ...prev };
    delete updated[departmentId];
    return updated;
  });
};
```

---

### File 2: `src/config/volumeOverrideColumns.tsx`

**Change 1: Add pending_volume to interface**

```typescript
export interface VolumeOverrideRow {
  // ... existing fields
  pending_volume?: number | null; // NEW
}
```

**Change 2: Update Override Volume column to show pending badge**

```typescript
renderCell: (row) => {
  const hasPending = row.pending_volume != null;
  const displayValue = row.pending_volume ?? row.override_volume;
  
  return (
    <OverrideVolumeCell
      value={displayValue}
      isPending={hasPending}  // NEW prop
      onSave={(value) => onSaveVolume(row.department_id, value)}
      onDelete={() => onDeleteOverride(row.department_id)}
      // ... rest
    />
  );
}
```

**Change 3: Update Expiration Date column to enable for pending**

```typescript
renderCell: (row) => {
  const hasOverride = row.override_volume != null;
  const hasPending = row.pending_volume != null;
  
  // Enable date picker if there's a saved OR pending override
  if (!hasOverride && !hasPending) {
    return (
      <div className="px-3 py-2 text-muted-foreground opacity-50">
        <span className="text-sm italic">Set override first</span>
      </div>
    );
  }
  // ... show date picker
}
```

**Change 4: Update Status column for Pending state**

```typescript
renderCell: (row) => {
  // Pending state (volume set but not saved to DB yet)
  if (row.pending_volume != null) {
    return (
      <div className="px-3 py-2">
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          Pending
        </Badge>
      </div>
    );
  }
  // ... rest of existing logic
}
```

---

### File 3: `src/components/editable-table/cells/OverrideVolumeCell.tsx`

**Change: Add isPending prop and show "Pending" badge**

```typescript
interface OverrideVolumeCellProps {
  // ... existing
  isPending?: boolean; // NEW
}

export function OverrideVolumeCell({
  // ...
  isPending = false,
}: OverrideVolumeCellProps) {
  // When pending, show value with Pending badge (no Revert button yet)
  // Revert only shows after full save (isPending = false && value exists)
}
```

---

## Updated User Flow

| Step | Action | Result |
|------|--------|--------|
| 1 | Click pencil on Override Volume | Input field appears |
| 2 | Enter value (e.g., 24.5), click ✓ | Value stored in memory, "Pending" badge shown, date picker enabled |
| 3 | Select expiration date | Both volume AND date saved to database together |
| 4 | After save | "Active" status, "Revert" button appears |
| 5 | Click Revert | Both volume and date cleared from database |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/staffing/SettingsTab.tsx` | Add pendingOverrides state, update handleSaveVolume to store in memory, update handleSaveDate to save both |
| `src/config/volumeOverrideColumns.tsx` | Add pending_volume field, update column logic for pending state |
| `src/components/editable-table/cells/OverrideVolumeCell.tsx` | Add isPending prop, show Pending badge when applicable |

