

# Fix Search UI Flicker

## Root Cause

The header search (`GlobalSearchCommand`) wraps a `Command` palette inside a `Popover`. When clicked:

1. SearchField (PopoverTrigger) gets focus
2. Popover opens, CommandInput auto-focuses
3. SearchField loses focus, Radix detects focus leaving the trigger
4. This creates a rapid focus/blur cycle -- the flicker

## Solution

Replace the `Popover`-based approach with `CommandDialog` (Dialog-based), which is the standard shadcn/ui pattern for command palettes. Dialog handles focus trapping correctly without fighting with the trigger element.

## File to Edit

**`src/components/shell/GlobalSearchCommand.tsx`**

### Changes:
1. Replace `Popover` / `PopoverTrigger` / `PopoverContent` with the click-to-open pattern using `CommandDialog`
2. The children (SearchField) become a simple `div` with `onClick` to open the dialog
3. `CommandDialog` properly traps focus inside the dialog, no focus fight with the trigger
4. Keep all existing navigation logic (sidebar modules, handleSelect) unchanged

**`src/components/shell/AppHeader.tsx`**

### Changes:
1. Wrap the SearchField in a plain `div` with `onClick` instead of as a Popover child
2. Pass `onClick` handler to open the command dialog

This is a structural fix to the focus management -- no visual changes to the search UI.
