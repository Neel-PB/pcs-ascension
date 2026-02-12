

## Change Avatar Fallback Background Color to Brand Blue

### What Changed
The username text color was changed to `#1E69D2` in the last edit -- that needs to be reverted back to `text-foreground`. Instead, the avatar fallback background should use `#1E69D2`.

### Files to Change

**`src/components/shell/AppHeader.tsx`** (line 138)
- Revert username span from `text-[#1E69D2]` back to `text-foreground`

**`src/components/ui/avatar.tsx`** (line 30)
- Change the `AvatarFallback` background from `bg-[#00a791]` to `bg-[#1E69D2]`

This updates the fallback avatar circle (showing initials) across the entire app -- header, profile modal, tables, etc. -- to use the brand blue instead of teal.

