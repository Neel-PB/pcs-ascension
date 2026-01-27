

# Align RBAC Detail View Headers

## Overview

Make the "Roles" header on the left and the selected role header on the right visually consistent in height and styling.

---

## Current Issue

| Element | Left Panel (Roles) | Right Panel (Admin) |
|---------|-------------------|---------------------|
| Padding | `p-3` | `p-3` |
| Font | `text-xs uppercase` | Regular size `font-semibold` |
| Height | ~36px (smaller text) | ~44px (larger text + badge) |

The left header appears shorter and less prominent than the right header.

---

## Solution

Standardize both headers with matching height and consistent typography:

1. Keep the same padding on both sides
2. Adjust the left header to match the visual weight of the right
3. Add explicit minimum height to ensure alignment

---

## Changes Required

### File: `src/components/admin/RoleDetailView.tsx`

**Update Left Panel Header (lines 477-481):**
```tsx
// FROM:
<div className="p-3 border-b bg-muted/30">
  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    Roles
  </h4>
</div>

// TO:
<div className="flex items-center h-[49px] px-3 border-b bg-muted/30">
  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    Roles
  </h4>
</div>
```

**Update Right Panel Header (lines 501-523):**
```tsx
// FROM:
<div className="flex items-center justify-between p-3 border-b bg-muted/30">

// TO:
<div className="flex items-center justify-between h-[49px] px-3 border-b bg-muted/30">
```

---

## Visual Result

```text
┌─────────────────────────────────────────────────────────┐
│  ROLES           │  Admin  [🔒 System]     [Reset (2)]  │
│  (same height)   │  (same height)                       │
├──────────────────┼──────────────────────────────────────┤
│  Admin           │  [Permission cards...]               │
│  Manager         │                                      │
└──────────────────┴──────────────────────────────────────┘
```

Both headers will now be exactly 49px tall with vertically centered content, creating a unified visual appearance.

---

## Files Summary

| File | Change |
|------|--------|
| `src/components/admin/RoleDetailView.tsx` | Add fixed height `h-[49px]` to both header divs for consistent alignment |

