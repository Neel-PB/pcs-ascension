
# Unify Roles and Permissions into Single Container

## Overview

Wrap the role list sidebar and permission details panel into a single bordered container with a cohesive layout, matching the app's unified card-based design pattern.

---

## Current State

```text
┌─────────────┐     ┌───────────────────────────┐
│   ROLES     │ gap │  Permission Details       │
│   (no border)    │  (has border)             │
└─────────────┘     └───────────────────────────┘
```

The roles list has no visual container, while the permission details panel has its own border. This creates a disconnected appearance.

---

## Proposed Design

```text
┌───────────────────────────────────────────────┐
│  ┌───────────┐ │  Permission Details Header  │
│  │  ROLES    │ │  ─────────────────────────  │
│  │  Admin    │ │  Modules    Settings        │
│  │  Manager  │ │  ...        ...             │
│  │  Director │ │  Sub-filters Filters        │
│  └───────────┘ │  ...        ...             │
└───────────────────────────────────────────────┘
```

A single outer container with:
- Vertical divider separating roles list from permissions
- Consistent background and border styling
- Both sections feel like one unified component

---

## Changes Required

### File: `src/components/admin/RoleDetailView.tsx`

**Update the main container (lines 307-308):**
```tsx
// FROM:
<div className="flex gap-4">

// TO:
<div className="flex border rounded-lg bg-card overflow-hidden">
```

**Update the roles sidebar (lines 309-327):**
```tsx
// FROM:
<div className="w-48 shrink-0 space-y-1">
  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
    Roles
  </h4>
  <div className="space-y-1">
    ...
  </div>
</div>

// TO:
<div className="w-52 shrink-0 border-r bg-muted/20">
  <div className="p-3 border-b bg-muted/30">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      Roles
    </h4>
  </div>
  <div className="p-2 space-y-1">
    ...
  </div>
</div>
```

**Update the permission details panel (line 331):**
```tsx
// FROM:
<div className="flex-1 border rounded-lg">

// TO:
<div className="flex-1">
```
Remove the individual border since the parent container now has it.

**Update "no role selected" state (lines 422+):**
Add a fallback state that also fits inside the unified container when no role is selected.

---

## Visual Changes

| Element | Before | After |
|---------|--------|-------|
| Outer container | No border, gap-4 | Single rounded border, no gap |
| Roles sidebar | No border, padding varies | Border-right, consistent header with bg-muted/30 |
| Permission panel | Own border, rounded-lg | No border (inherits from parent) |
| Roles header | Inline text | Header bar matching permission panel header style |

---

## Result

The RBAC detail view will have a unified card appearance:
- Single bordered container wrapping both sections
- Vertical divider between roles and permissions
- Matching header styles for "Roles" and the selected role name
- Consistent with the app's card-based design pattern
