

# Improve Selection Highlighting in RBAC Interface

## Overview

Apply the same visual selection pattern used in the sidebar navigation to:
1. The role list in the Detail View (left panel)
2. The view mode toggle buttons (Matrix, Detail, List)

The sidebar uses `bg-primary` with `text-primary-foreground` for selected items, creating a prominent, consistent selection indicator.

---

## Current State

### Role Selection (RoleDetailView)
Current styling for selected role:
```tsx
isSelected 
  ? "border-primary bg-primary/5 ring-1 ring-primary" 
  : "border-transparent hover:border-border"
```
This uses a very subtle 5% opacity primary background, which doesn't stand out enough.

### View Mode Toggle (AccessControlPage)
Current styling uses default toggle variants:
```tsx
data-[state=on]:bg-accent data-[state=on]:text-accent-foreground
```
This uses accent color (typically gray) rather than primary, making it less prominent.

---

## Solution

### 1. Update Role Card Selection

Match the sidebar pattern with solid primary background:

| Element | Before | After |
|---------|--------|-------|
| Selected bg | `bg-primary/5` | `bg-primary` |
| Selected text | Default | `text-primary-foreground` |
| Selected border | `border-primary ring-1` | `border-transparent` (cleaner) |

### 2. Update View Mode Toggle

Apply custom data-state styling to use primary colors:

| Element | Before | After |
|---------|--------|-------|
| Selected bg | `bg-accent` | `bg-primary` |
| Selected text | `text-accent-foreground` | `text-primary-foreground` |

---

## Implementation

### File: `src/components/admin/RoleDetailView.tsx`

**Update CompactRoleCard (lines 57-64):**
```tsx
// FROM:
<div
  className={cn(
    "w-full text-left px-3 py-2 rounded-md border transition-all flex items-center justify-between gap-2 group",
    "hover:bg-muted/50",
    isSelected 
      ? "border-primary bg-primary/5 ring-1 ring-primary" 
      : "border-transparent hover:border-border"
  )}
>

// TO:
<div
  className={cn(
    "w-full text-left px-3 py-2 rounded-md transition-all flex items-center justify-between gap-2 group relative",
    isSelected 
      ? "bg-primary text-primary-foreground" 
      : "hover:bg-muted/50"
  )}
>
```

**Update role label text (line 75):**
```tsx
// FROM:
<span className="font-medium text-sm truncate">{role.label}</span>

// TO:
<span className={cn(
  "font-medium text-sm truncate",
  isSelected ? "text-primary-foreground" : ""
)}>{role.label}</span>
```

**Update indicator dots (lines 70-74) for visibility on primary background:**
```tsx
// FROM:
{hasPendingChanges ? (
  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
) : overrideCount > 0 ? (
  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
) : null}

// TO:
{hasPendingChanges ? (
  <span className={cn(
    "w-1.5 h-1.5 rounded-full shrink-0",
    isSelected ? "bg-primary-foreground" : "bg-primary"
  )} />
) : overrideCount > 0 ? (
  <span className={cn(
    "w-1.5 h-1.5 rounded-full shrink-0",
    isSelected ? "bg-warning-foreground" : "bg-warning"
  )} />
) : null}
```

**Update dropdown trigger for selected state (line 82):**
```tsx
// FROM:
className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"

// TO:
className={cn(
  "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
  isSelected && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
)}
```

---

### File: `src/pages/admin/AccessControlPage.tsx`

**Update ToggleGroupItem styling (lines 104, 114, 124):**

Add custom class to override the default accent styling with primary:

```tsx
// FROM:
<ToggleGroupItem value="matrix" aria-label="Matrix view" className="h-8 px-2.5">

// TO:
<ToggleGroupItem 
  value="matrix" 
  aria-label="Matrix view" 
  className="h-8 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
>
```

Apply the same pattern to all three ToggleGroupItems (matrix, detail, list).

---

## Visual Result

### Role List (Before vs After)
```text
Before:                          After:
┌──────────────────┐             ┌──────────────────┐
│ ○ Admin          │ (subtle)    │ ████████████████ │ (prominent)
│   Labor Mgr      │             │   Labor Mgr      │
│   Leadership     │             │   Leadership     │
└──────────────────┘             └──────────────────┘

The selected role will have:
- Solid primary background (matches sidebar)
- White/light text for contrast
- No border artifacts
```

### View Toggle (Before vs After)
```text
Before:                          After:
┌────┬────┬────┐                 ┌────┬────┬────┐
│ □  │[▦] │ ≡  │ (gray accent)   │ □  │[▦] │ ≡  │ (primary color)
└────┴────┴────┘                 └────┴────┴────┘

The selected toggle will have:
- Primary background (not gray accent)
- Primary-foreground text/icon color
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/RoleDetailView.tsx` | Update CompactRoleCard with `bg-primary text-primary-foreground` when selected; adjust indicator dots and dropdown for contrast |
| `src/pages/admin/AccessControlPage.tsx` | Add `data-[state=on]:bg-primary data-[state=on]:text-primary-foreground` to all ToggleGroupItems |

