
# Make Permission Matrix Table Fill Available Width

## Overview

Update the Permission Matrix table to fill the full container width instead of using fixed column widths that leave empty space after the last role column.

---

## Current Issue

The table uses fixed widths:
- Permission column: `w-56` (224px)
- Each role column: `w-28` (112px)
- Container has `min-w-max` preventing any expansion

With 6 roles: 224 + (112 × 6) = 896px total, leaving ~40% empty space on wider screens.

---

## Solution

Change role columns from fixed `w-28` to flexible `flex-1` so they expand evenly to fill available space. Keep a minimum width to ensure readability.

---

## Changes Required

### File: `src/components/admin/PermissionMatrix.tsx`

**1. Update container structure (line 217):**
```tsx
// FROM:
<div className="min-w-max">

// TO:
<div className="w-full">
```

**2. Update header row (line 219):**
```tsx
// FROM:
<div className="flex border-b bg-muted/30">

// TO:
<div className="flex border-b bg-muted/30 w-full">
```

**3. Update role column headers (lines 230-232):**
```tsx
// FROM:
<div
  key={role.id}
  className="w-28 shrink-0 px-2 py-2 text-center border-r last:border-r-0"
>

// TO:
<div
  key={role.id}
  className="flex-1 min-w-[100px] px-2 py-2 text-center border-r last:border-r-0"
>
```

**4. Update category header empty cells (lines 327-329):**
```tsx
// FROM:
{roles.map((role) => (
  <div key={role.id} className="w-28 shrink-0 border-r last:border-r-0" />
))}

// TO:
{roles.map((role) => (
  <div key={role.id} className="flex-1 min-w-[100px] border-r last:border-r-0" />
))}
```

**5. Update permission rows structure (line 440):**
```tsx
// FROM:
<div className="flex border-b last:border-b-0 hover:bg-muted/30 transition-colors">

// TO:
<div className="flex border-b last:border-b-0 hover:bg-muted/30 transition-colors w-full">
```

**6. Update role checkbox cells (lines 469-474):**
```tsx
// FROM:
<div
  key={role.id}
  className={cn(
    "w-28 shrink-0 flex items-center justify-center border-r last:border-r-0",
    isPending && "bg-primary/5"
  )}
>

// TO:
<div
  key={role.id}
  className={cn(
    "flex-1 min-w-[100px] flex items-center justify-center border-r last:border-r-0",
    isPending && "bg-primary/5"
  )}
>
```

---

## Visual Result

| Before | After |
|--------|-------|
| Fixed 896px width | Fills container width |
| Empty space after Manager | All columns expand evenly |
| Role columns: 112px each | Role columns: flexible (min 100px) |

```text
Before:
┌─────────┬───────┬───────┬───────┬───────┬───────┬───────┐░░░░░░
│Permission│Admin │L.Mgr  │Lead   │CNO    │Dir    │Mgr    │ empty
└─────────┴───────┴───────┴───────┴───────┴───────┴───────┘░░░░░░

After:
┌──────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│Permission│  Admin  │  L.Mgr  │  Lead   │   CNO   │   Dir   │   Mgr   │
└──────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/PermissionMatrix.tsx` | Change fixed `w-28` to `flex-1 min-w-[100px]` for role columns; change container from `min-w-max` to `w-full` |
