

# Swap Colors for Skill Group Rows

## Requested Change

Based on your screenshot and request, you want to swap the colors:
- **Group headers** (Overheads, Clinical Staff, Support Staff): **Blue tint** (`bg-primary/5`)
- **Inner expanded rows** (Director, Manager, RN, PCT, etc.): **White/no background** (default)

This is the opposite of the current implementation.

---

## Visual Preview

```text
Current (wrong):                     Requested (correct):
┌─────────────────────────┐         ┌─────────────────────────┐
│ Overheads    [gray]     │         │ Overheads    [BLUE]     │  ← Blue tint
│   ├─ Director [blue]    │         │   ├─ Director [white]   │  ← White/default
│   └─ Manager  [blue]    │         │   └─ Manager  [white]   │  ← White/default
├─────────────────────────┤         ├─────────────────────────┤
│ Clinical     [gray]     │         │ Clinical     [BLUE]     │  ← Blue tint
│   ├─ RN       [blue]    │         │   ├─ RN       [white]   │  ← White/default
│   └─ Lead     [blue]    │         │   └─ Lead     [white]   │  ← White/default
├─────────────────────────┤         ├─────────────────────────┤
│ Support      [gray]     │         │ Support      [BLUE]     │  ← Blue tint
│   └─ PCT      [blue]    │         │   └─ PCT      [white]   │  ← White/default
└─────────────────────────┘         └─────────────────────────┘
```

---

## Technical Changes

**File: `src/pages/staffing/PositionPlanning.tsx`**

### 1. Update GroupRow (Line 364)

Change from gray (`bg-muted/40`) back to blue (`bg-primary/5`):

```typescript
// Before
className="font-semibold bg-muted/40 hover:bg-muted/50 transition-colors cursor-pointer border-t-2 border-muted-foreground/30"

// After
className="font-semibold bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border-t-2 border-primary/20"
```

### 2. Update SkillRow (Lines 424-427)

Remove the blue tint from child rows - make them white/default:

```typescript
// Before
className={cn(
  "hover:bg-muted/30 transition-colors",
  isChildRow && "bg-primary/5"
)}

// After
className="hover:bg-muted/30 transition-colors"
```

---

## Summary

| Row Type | Current | New |
|----------|---------|-----|
| **Group Headers** (Overheads, Clinical, Support) | `bg-muted/40` (gray) | `bg-primary/5` (blue) |
| **Child Rows** (Director, Manager, RN, etc.) | `bg-primary/5` (blue) | No background (white) |
| **Total Row** | `bg-muted/50` | Keep as-is |

This creates the visual hierarchy you requested where parent skill categories stand out with the blue tint while their expanded children have a clean white background.

