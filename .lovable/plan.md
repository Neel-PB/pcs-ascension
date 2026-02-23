

## Reduce Notification Button Size to 32px

### Change

**File: `src/components/shell/AppHeader.tsx`**

The notification bell button currently uses `size="icon"` which renders at 40px (h-10 w-10). Add explicit `h-8 w-8` classes to override it to 32px.

**Line ~119**: Change the Button className from `"relative"` to `"relative h-8 w-8"`.

### File Changed
- `src/components/shell/AppHeader.tsx` -- reduce notification button from 40px to 32px

