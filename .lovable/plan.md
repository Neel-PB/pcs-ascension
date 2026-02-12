

## Header Icon Size and Username Color Updates

### Changes

**1. Increase notification and theme icons from 20px to 24px**

In `src/components/shell/AppHeader.tsx`:
- Line 106: Bell icon `h-5 w-5` to `h-6 w-6`
- Line 61: Moon icon `h-5 w-5` to `h-6 w-6`
- Line 62: Monitor icon `h-5 w-5` to `h-6 w-6`
- Line 63: Sun icon `h-5 w-5` to `h-6 w-6`

**2. Change username text color to brand blue (#1E69D2)**

In `src/components/shell/AppHeader.tsx`:
- Line 138: Change `text-foreground` to `text-[#1E69D2]` on the username span

### Files Modified

| File | Change |
|---|---|
| `src/components/shell/AppHeader.tsx` | Icon sizes 20px to 24px; username color to `#1E69D2` |

