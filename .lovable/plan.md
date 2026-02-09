

# Fix Expiration Date Column Layout

## Changes

### 1. Replace "Set override first" with "-- [Pencil]" pattern

**File:** `src/config/volumeOverrideColumns.tsx` (lines 141-146)

When no override volume is set, instead of showing italic "Set override first" text, show a dash on the left and a pencil icon on the right -- matching the Override Volume idle state pattern.

**Current:**
```text
| Set override first                    |
```

**Target:**
```text
| --                          [Pencil]  |
```

The pencil icon will remain disabled/non-interactive (since you still need to set an override volume first), but it provides visual consistency with the other columns.

### 2. Remove extra padding wrapper around EditableDateCell

**File:** `src/config/volumeOverrideColumns.tsx` (lines 153-163)

The `EditableDateCell` already has its own `px-3` padding, but there's an extra wrapping `div` with `px-3 py-2` causing double padding and potentially misaligning the text. Remove the redundant wrapper so the date text aligns flush left like other columns.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/volumeOverrideColumns.tsx` | Replace "Set override first" with `-- [Pencil]` layout; remove redundant padding wrapper around EditableDateCell |

