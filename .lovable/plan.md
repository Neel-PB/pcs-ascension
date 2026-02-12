

## Align Select Trigger to Helix Field Spec

### Problem
The SelectTrigger styling doesn't fully match the Helix spec. Border radius is now correct (8px / `rounded-lg`), but padding and spacing are off.

### Current vs. Spec

| Property | Current | Helix Spec |
|---|---|---|
| Border radius | `rounded-lg` (8px) | 8px -- already correct |
| Left/Right padding | `px-3` (12px) | 16px (`px-4`) |
| Top/Bottom padding | `py-2` (8px) | 12px (`py-3`) |
| Height | `h-10` (40px) | Auto from padding (should be ~48px with 12px top + 12px bottom + line height) |
| Stroke | 1px -- correct | 1px |
| Chevron right spacing | included in px-3 | 8px gap from right edge |

### Changes

**File: `src/components/ui/select.tsx`**

Update `SelectTrigger` className:
- Change `px-3` to `px-4` (16px horizontal padding)
- Change `py-2` to `py-3` (12px vertical padding)
- Remove fixed `h-10` so height is driven by padding + content (results in ~48px naturally)
- Ensure the chevron icon has proper right spacing

### What stays the same
- `rounded-lg`, border color, focus states, open states all unchanged
- Dropdown content panel styling unchanged
- All other components unaffected

