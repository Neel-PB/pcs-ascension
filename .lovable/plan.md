

## Add Missing Icons to User Menu Items

### Problem
Three menu items in the user dropdown lack icons: the user label area, "Profile", and "Log out" — while the other items (Tour This Page, Full Guided Tour, All Tours, View All Guides) all have icons.

### Changes

**File: `src/components/shell/AppHeader.tsx`**

1. Import `LogOut` icon — need to add it to `@/lib/icons` first since it doesn't exist yet.

2. Add icon to **Profile** item (line 154-155):
```tsx
<DropdownMenuItem onSelect={() => setProfileModalOpen(true)}>
  <User className="h-4 w-4 mr-2" />
  <span>Profile</span>
</DropdownMenuItem>
```

3. Add icon to **Log out** item (line 183-185):
```tsx
<DropdownMenuItem onClick={handleSignOut}>
  <LogOut className="h-4 w-4 mr-2" />
  <span>Log out</span>
</DropdownMenuItem>
```

4. Add icon to **User label** area (line 145-151) — add a small `User` icon next to the name:
```tsx
<DropdownMenuLabel className="font-normal">
  <div className="flex items-start gap-2">
    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
    <div className="flex flex-col space-y-1">
      <p className="text-sm font-medium leading-none">{userName}</p>
      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
    </div>
  </div>
</DropdownMenuLabel>
```

**File: `src/lib/icons.ts`**
- Add `MdLogout as LogOut` export (for the log out icon)

**File: `src/components/shell/AppHeader.tsx`**
- Update import to include `User` and `LogOut` from `@/lib/icons`

Two files changed, icons-only addition.

