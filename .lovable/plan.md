
# Fix Access Scope Filter Selection Not Working

## Problem
The Region and Market dropdowns in the Edit User form's Access Scope section are not responding to selections. When clicking on items, the checkboxes remain unchecked and the "No restrictions" text persists.

## Root Cause Analysis
Looking at the `MultiSelectChips` component, the issue is in how the `Checkbox` component is wrapped inside a `<label>` element:

```tsx
<label className="...">
  <Checkbox
    checked={isSelected}
    onCheckedChange={() => handleToggle(option.value)}
  />
</label>
```

The Radix UI `Checkbox` component uses an internal button element, and when wrapped in a `<label>`, there can be double-triggering or event conflicts. When clicking the label, it may:
1. Trigger the label's click → which triggers the checkbox
2. But the `onCheckedChange` event can get into a toggle loop or not fire correctly

## Solution
Change the click handling to use an explicit `onClick` on the parent container instead of relying on `<label>` + `onCheckedChange`:

### File: `src/components/ui/multi-select-chips.tsx`

**Changes:**
1. Replace the `<label>` element with a `<div>` 
2. Move the click handler to the parent `<div>` with `onClick={() => handleToggle(option.value)}`
3. Make the `Checkbox` purely presentational (remove `onCheckedChange`, keep only `checked`)

**Before:**
```tsx
<label className="flex items-start gap-2 p-2 rounded-md cursor-pointer...">
  <Checkbox
    checked={isSelected}
    onCheckedChange={() => handleToggle(option.value)}
    className="mt-0.5"
  />
  ...
</label>
```

**After:**
```tsx
<div 
  role="option"
  aria-selected={isSelected}
  onClick={() => handleToggle(option.value)}
  className="flex items-start gap-2 p-2 rounded-md cursor-pointer..."
>
  <Checkbox
    checked={isSelected}
    className="mt-0.5 pointer-events-none"
  />
  ...
</div>
```

### Also Update: `src/components/admin/AccessScopeManager.tsx`

Apply the same fix to the Facility and Department custom popovers (lines 466-499 and 536-569):

**Before (Facility):**
```tsx
<label
  key={facility.facility_id}
  className={cn("flex items-center gap-2 p-2 rounded-md cursor-pointer...")}
>
  <Checkbox
    checked={isSelected}
    onCheckedChange={() => handleFacilityToggle(facility.facility_id)}
    className="shrink-0"
  />
  ...
</label>
```

**After:**
```tsx
<div
  key={facility.facility_id}
  role="option"
  aria-selected={isSelected}
  onClick={() => handleFacilityToggle(facility.facility_id)}
  className={cn("flex items-center gap-2 p-2 rounded-md cursor-pointer...")}
>
  <Checkbox
    checked={isSelected}
    className="shrink-0 pointer-events-none"
  />
  ...
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/multi-select-chips.tsx` | Replace `<label>` with `<div>`, use `onClick` on container, make Checkbox presentational with `pointer-events-none` |
| `src/components/admin/AccessScopeManager.tsx` | Same fix for Facility and Department custom popovers |

---

## Expected Outcome

- Clicking on a Region/Market/Facility/Department item will properly toggle the selection
- Selected items will show as chips with the remove (X) button
- The checkbox will show the checked state (filled blue with checkmark)
- The "No restrictions" text will be replaced with the selected chips
