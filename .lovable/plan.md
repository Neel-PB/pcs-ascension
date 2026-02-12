
## Align Date Picker with Helix Design System Specs

### Problem
The current date picker in Volume Settings and NP Settings is a bare calendar popover -- clicking the pencil icon opens a plain calendar grid where selecting a date immediately saves it. The Helix spec defines a richer date picker with:

1. **Header section** -- "Select a date" label + the currently selected date displayed prominently
2. **Calendar grid** -- month/year selector with navigation (already implemented)
3. **Action area (footer)** -- CANCEL and OK buttons to confirm or dismiss the selection

Currently, clicking a date immediately commits it to the database with no way to cancel. The Helix pattern requires a two-step confirmation: pick a date visually, then click OK to confirm or CANCEL to dismiss.

### Solution

Update the `EditableDateCell` component to wrap the `Calendar` with a header and footer action area inside the popover.

### Changes

**File: `src/components/editable-table/cells/EditableDateCell.tsx`**

1. Add a **header section** above the Calendar inside the PopoverContent:
   - Small label text: "Select a date" (text-xs, text-muted-foreground)
   - Selected date displayed below in Body 3 style (text-sm, font-medium)
   - Padding: top/bottom 24px (py-6)

2. Change the **selection behavior**:
   - Currently: `onSelect` immediately calls `onSave()` and closes the popover
   - New: `onSelect` only updates a local `pendingDate` state (visual selection)
   - The popover stays open until the user clicks OK or CANCEL

3. Add a **footer action area** below the Calendar:
   - CANCEL button (ghost variant) -- closes the popover without saving, reverts to previous date
   - OK button (default/primary variant) -- commits the selected date via `onSave()` and closes
   - Padding: top/bottom 8px (py-2), 24px gap between buttons (gap-6)
   - Buttons have 12px internal padding (px-3)

4. Add a **separator** between the calendar grid and the action area

### Technical Details

The key state management change:

```text
Current flow:
  Click pencil -> Popover opens -> Click date -> onSave() called -> Popover closes

New Helix flow:
  Click pencil -> Popover opens (with header + footer)
  -> Click date -> local pendingDate updated (visual highlight only)
  -> Click OK -> onSave(pendingDate) called -> Popover closes
  -> Click CANCEL -> pendingDate discarded -> Popover closes
```

State variables:
- `date` -- the committed/saved date (synced with `value` prop)
- `pendingDate` -- the visually selected date inside the open popover (local only)
- `isOpen` -- popover open state

The Calendar's `selected` prop will point to `pendingDate` while the popover is open, allowing the user to see their selection highlighted before confirming.

### Scope
- Single file change: `src/components/editable-table/cells/EditableDateCell.tsx`
- No changes to the `Calendar` component itself (already Helix-compliant)
- Applies globally to both Volume Settings and NP Settings expiration date columns
