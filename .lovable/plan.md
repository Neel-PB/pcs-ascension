

# Fix Column Order for Volume Settings Table

## Problem

The **column order** in the code is correct:
1. Department
2. Target Volume
3. **Override Volume**
4. **Expiration Date**
5. **Max Expiration**
6. Status

However, the browser is showing the **old cached order** because the column store persists column orders in localStorage under the namespace `volume-override-settings`.

---

## Solution

Update the `storeNamespace` from `"volume-override-settings"` to `"volume-override-settings-v2"`. This forces a fresh initialization with the correct column order for all users.

---

## File to Modify

**`src/pages/staffing/SettingsTab.tsx`** (Line 268)

Change:
```typescript
storeNamespace="volume-override-settings"
```

To:
```typescript
storeNamespace="volume-override-settings-v2"
```

---

## Why This Works

The `useColumnStore` persists column states (including order) in localStorage. When the namespace changes:
1. No existing cached data exists for the new namespace
2. The `initializeColumns` function creates fresh column states from the column definitions
3. Users see the correct column order: **Override Volume → Expiration Date → Max Expiration**

---

## Summary

| Change | File | Line |
|--------|------|------|
| Update namespace from `volume-override-settings` to `volume-override-settings-v2` | `src/pages/staffing/SettingsTab.tsx` | 268 |

This is a single-line change that resets the persisted column order for all users.

