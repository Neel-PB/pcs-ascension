

# Reserve Space for Shared Position Form

## Problem

When selecting "Shared Position" status, the popover content expands and triggers Radix's collision avoidance to reposition the popover. This creates a jarring jump effect.

## Solution

Reserve the full height needed for the Shared Position form from the start using an invisible placeholder. The popover will calculate its position based on this maximum height, and content will appear within the already-positioned container.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Add invisible placeholder to reserve space (Around line 297)

Add a hidden div that reserves the height for the Shared Position form fields (approximately 280px for all fields: Share With cascading selects, Shared FTE, Shared Expiry):

```typescript
// AFTER the Status / Reason dropdown, BEFORE the dynamic content area:

{/* Invisible placeholder to reserve space for Shared Position form */}
{/* This ensures the popover positions correctly from the start */}
<div className="invisible h-0 overflow-hidden pointer-events-none" aria-hidden="true">
  <div className="space-y-3 mt-3">
    {/* Reserve space for: Share With, Shared FTE, Shared Expiry */}
    <div className="h-[280px]" />
  </div>
</div>

{/* Dynamic content area - overlays the placeholder */}
<div className="relative mt-3">
  ...existing content...
</div>
```

#### Alternative Approach: Use CSS min-height

A cleaner approach is to set a minimum height on the content container that matches the Shared Position form:

```typescript
// BEFORE:
<div className="p-3">

// AFTER:
<div className="p-3 min-h-[360px]">
```

This ensures the popover always calculates its position based on the full Shared Position form height (~360px includes Status dropdown + all Shared Position fields + Actions).

---

## How It Works

| Scenario | Before | After |
|----------|--------|-------|
| Open popover | Positioned for small Status dropdown | Positioned for full form height |
| Select Shared Position | Popover jumps to accommodate content | Content animates within fixed container |
| Select other status | Popover may jump back | Container maintains size, no jump |

---

## Trade-off

The popover will always be sized for the largest possible content (Shared Position form), even when showing smaller forms. This creates consistent visual behavior at the cost of slightly more empty space for non-Shared statuses.

