

# Override Volume Column Enhancement Plan

## Overview

This plan modifies the **Override Volume** column in the Volume Settings tab to provide a cleaner editing workflow:

1. Show **pencil icon** to initiate editing (instead of immediately showing the editable field)
2. Once clicked, show the **input field with Accept (✓) and Delete (✗) buttons**
3. After saving the override volume, **enable the Expiration Date column** for that row
4. **Reorder columns**: Override Volume → Expiration Date → Max Expiration

---

## Current vs. Proposed Flow

```text
CURRENT FLOW:
┌──────────────────────────────────────────────────┐
│ [Badge] Required/Optional    [Editable Field]   │
└──────────────────────────────────────────────────┘
  ↓ User types value, blur saves immediately

PROPOSED FLOW:
┌──────────────────────────────────────────────────┐
│ [Badge] Required/Optional    [— ✏️ Pencil]      │  ← Initial state
└──────────────────────────────────────────────────┘
                     ↓ Click pencil
┌──────────────────────────────────────────────────┐
│ [Badge] Required/Optional   [____] ✓ ✗          │  ← Editing state
└──────────────────────────────────────────────────┘
                     ↓ Click ✓ (Accept)
┌──────────────────────────────────────────────────┐
│ [Badge] Required/Optional   [123]  ✏️ 🗑️        │  ← Saved state
└──────────────────────────────────────────────────┘
  ↓ Expiration Date column now enabled
```

---

## Column Order Change

| Current Order | New Order |
|---------------|-----------|
| 1. Department | 1. Department |
| 2. Target Volume | 2. Target Volume |
| 3. Override Volume | 3. Override Volume |
| 4. **Max Expiration** | 4. **Expiration Date** |
| 5. **Expiration Date** | 5. **Max Expiration** |
| 6. Status | 6. Status |

---

## Files to Modify

### 1. New Component: `OverrideVolumeCell.tsx`
**Path**: `src/components/editable-table/cells/OverrideVolumeCell.tsx`

Create a new dedicated cell component that manages the three-state workflow:

```text
States:
- idle: Shows current value (or "—") with pencil icon
- editing: Shows input field with Accept/Cancel buttons
- saved: Shows value with Edit pencil and Delete trash icons
```

**Component Props**:
- `value`: Current override volume (number | null)
- `onSave`: Callback to save the value
- `onDelete`: Callback to delete/clear the override
- `badgeProps`: Badge configuration (icon, label, color, tooltip)
- `showWarning`: Whether to show warning icon
- `warningTooltip`: Warning message

### 2. Update `volumeOverrideColumns.tsx`
**Path**: `src/config/volumeOverrideColumns.tsx`

Changes:
- Import and use the new `OverrideVolumeCell` component
- Add `onDelete` callback prop to `createVolumeOverrideColumns`
- Pass `hasOverrideValue` prop to Expiration Date column to control enabled state
- **Reorder columns**: Move `expiry_date` before `max_allowed_expiry`

### 3. Update `SettingsTab.tsx`
**Path**: `src/pages/staffing/SettingsTab.tsx`

Changes:
- Pass `handleDeleteVolume` function to column creator
- Update column creator call with delete handler

---

## Technical Details

### New `OverrideVolumeCell` Component Logic

```typescript
// Three states the cell can be in
type CellState = 'idle' | 'editing' | 'saved';

function OverrideVolumeCell({
  value,
  onSave,
  onDelete,
  badge,
  showWarning,
  warningTooltip
}) {
  const [state, setState] = useState<CellState>(
    value != null ? 'saved' : 'idle'
  );
  const [editValue, setEditValue] = useState('');

  // State transitions:
  // idle -> (click pencil) -> editing
  // editing -> (click accept) -> saved
  // editing -> (click cancel) -> idle
  // saved -> (click pencil) -> editing
  // saved -> (click delete) -> idle

  // Render based on state...
}
```

### Visual Design

**Idle State** (no value set):
```text
┌─────────────────────────────────────────────────┐
│ 🛡️ Required   │   —   ✏️                        │
└─────────────────────────────────────────────────┘
```

**Editing State** (input active):
```text
┌─────────────────────────────────────────────────┐
│ 🛡️ Required   │ [_______]  ✓  ✗                │
└─────────────────────────────────────────────────┘
```

**Saved State** (value exists):
```text
┌─────────────────────────────────────────────────┐
│ 🛡️ Optional   │   123   ✏️  🗑️                 │
└─────────────────────────────────────────────────┘
```

### Expiration Date Conditional Enable

The Expiration Date cell will be **disabled** (grayed out, non-clickable) until an override volume is saved:

```typescript
// In volumeOverrideColumns.tsx - expiry_date column
renderCell: (row) => {
  const isEnabled = row.override_volume != null;
  
  if (!isEnabled) {
    return (
      <div className="px-3 py-2 text-muted-foreground opacity-50 cursor-not-allowed">
        <span className="text-sm">Set override first</span>
      </div>
    );
  }
  
  // Normal EditableDateCell when enabled
  return <EditableDateCell ... />;
}
```

---

## Implementation Sequence

1. **Create `OverrideVolumeCell.tsx`** - New cell component with 3-state logic
2. **Update `volumeOverrideColumns.tsx`**:
   - Add `onDelete` parameter to column creator function
   - Replace `BadgeWithEditableValue` with new `OverrideVolumeCell`
   - Add conditional disable logic to Expiration Date column
   - Reorder columns (swap expiry_date and max_allowed_expiry positions)
3. **Update `SettingsTab.tsx`**:
   - Create `handleDeleteVolume` function
   - Pass delete handler to column creator
4. **Test the complete workflow**

---

## Summary of User Experience

| Step | Action | Result |
|------|--------|--------|
| 1 | User sees row with no override | Shows "—" with pencil icon, Expiration disabled |
| 2 | User clicks pencil icon | Input field appears with ✓ and ✗ buttons |
| 3 | User enters value and clicks ✓ | Value saves, shows pencil + trash icons |
| 4 | **Expiration Date now enabled** | User can select expiration date |
| 5 | User can click pencil to edit | Returns to editing state |
| 6 | User can click trash to delete | Clears override, disables expiration again |

