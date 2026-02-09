

# Adjust Column Widths in Volume Settings Table

## Current vs. Proposed Widths

```text
CURRENT:
┌─────────────┬──────────────┬────────────────┬───────────────┬──────────────┬────────┐
│ Department  │ Target Vol   │ Override Vol   │ Expiration    │ Max Expiry   │ Status │
│   200px     │   240px      │    260px       │    200px      │   150px      │ 150px  │
└─────────────┴──────────────┴────────────────┴───────────────┴──────────────┴────────┘

PROPOSED:
┌──────────────────┬──────────────┬────────────────┬───────────────┬──────────────┬────────┐
│ Department       │ Target Vol   │ Override Vol   │ Expiration    │ Max Expiry   │ Status │
│   280px          │   200px      │    220px       │    200px      │   150px      │ 150px  │
└──────────────────┴──────────────┴────────────────┴───────────────┴──────────────┴────────┘
```

---

## Technical Changes

### File: `src/config/volumeOverrideColumns.tsx`

| Column | Current | New | Change |
|--------|---------|-----|--------|
| **Department** | width: 200, minWidth: 150 | **width: 280, minWidth: 220** | +80px |
| **Target Volume** | width: 240, minWidth: 200 | **width: 200, minWidth: 160** | -40px |
| **Override Volume** | width: 260, minWidth: 220 | **width: 220, minWidth: 180** | -40px |

**Line 64-65** (Department column):
```typescript
width: 280,
minWidth: 220,
```

**Line 78-79** (Target Volume column):
```typescript
width: 200,
minWidth: 160,
```

**Line 102-103** (Override Volume column):
```typescript
width: 220,
minWidth: 180,
```

---

## Additional Step: Reset Persisted Column State

Since column widths are stored in localStorage via `useColumnStore`, we need to update the store namespace to force a reset:

### File: `src/pages/staffing/SettingsTab.tsx`

Update the `storeNamespace` from `volume-override-settings-v2` to `volume-override-settings-v3` to ensure users get the new column widths.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/volumeOverrideColumns.tsx` | Increase Department width to 280px, decrease Target Volume to 200px, decrease Override Volume to 220px |
| `src/pages/staffing/SettingsTab.tsx` | Update storeNamespace to `volume-override-settings-v3` to reset cached widths |

