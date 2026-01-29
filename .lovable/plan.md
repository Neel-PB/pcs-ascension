

# Fix: Active FTE Popover Being Cut Off

## Problem

When selecting "Shared Position" in the Active FTE form, the popover expands to show additional fields. However, the bottom portion of the popover (including the Save button) is being cut off and hidden behind other elements.

## Root Cause

Two issues are causing this:

1. **CSS `contain: strict`**: The `VirtualizedTableBody` component uses `style={{ contain: 'strict' }}` which creates an aggressive containment context that can interfere with how Portals render and position their content

2. **Popover Collision Detection**: The Radix Popover needs explicit configuration to avoid collisions with viewport boundaries when the content is tall

3. **Nested Popover z-index**: The date picker popovers inside the form may have conflicting z-index with the parent popover

## Solution

### 1. Update PopoverContent in EditableFTECell

Add collision handling properties to ensure the popover repositions itself when it would be cut off:

```typescript
<PopoverContent 
  className="w-80 p-4" 
  align="center"
  side="top"                    // Prefer opening above the trigger
  sideOffset={8}
  collisionPadding={20}         // Keep 20px from viewport edges
  avoidCollisions={true}        // Enable collision detection
>
```

### 2. Increase z-index for Nested Calendar Popovers

The calendar popovers inside the form need higher z-index to appear above the parent popover:

```typescript
<PopoverContent className="w-auto p-0 z-[60]" align="start">
  <Calendar ... />
</PopoverContent>
```

### 3. Adjust VirtualizedTableBody Containment (Optional)

If the above doesn't fully resolve the issue, change the containment to be less aggressive:

```typescript
// Change from:
style={{ contain: 'strict' }}

// To:
style={{ contain: 'layout' }}
```

This maintains performance benefits for virtualization while allowing portaled content to render correctly.

---

## Technical Changes

| File | Change |
|------|--------|
| `src/components/editable-table/cells/EditableFTECell.tsx` | Add `side="top"`, `collisionPadding`, and `avoidCollisions` props to main PopoverContent; increase z-index on nested calendar popovers |
| `src/components/editable-table/VirtualizedTableBody.tsx` | Change `contain: 'strict'` to `contain: 'layout'` (only if needed) |

---

## Expected Outcome

- The Active FTE popover will automatically reposition (open above or below) to avoid being cut off
- All form fields including the Save button will be fully visible
- Nested calendar pickers will appear above the form popover without z-index conflicts

