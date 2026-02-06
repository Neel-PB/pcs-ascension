

# Uniform Color Styling for Skill Group Rows

## Current Issue

In the **Planned/Active Resources** table (FTE Skill Shift Analysis), all three skill group header rows currently have the same styling (`bg-primary/5`), but you want:
1. **Group headers** (Overheads, Clinical Staff, Support Staff): All use the **same neutral/uniform color**
2. **Inner expanded rows** (Director, Manager, RN, PCT, etc.): Can have **different/distinct colors** to visually differentiate them from parent groups

---

## Proposed Color Scheme

| Row Type | Current Style | New Style |
|----------|---------------|-----------|
| **Group Headers** (Overheads, Clinical Staff, Support Staff) | `bg-primary/5` | `bg-muted/40` (neutral gray) |
| **Expanded Child Rows** (Director, Manager, RN, etc.) | `bg-primary/5` | `bg-primary/5` (keep tinted) |
| **Total Row** | `bg-muted/20` | `bg-muted/50` (slightly darker) |

This creates a visual hierarchy:
- Group headers are **neutral/uniform** (muted gray)
- Child rows are **tinted** (primary color tint) for distinction
- Total row is **prominently gray** for summary emphasis

---

## Visual Preview

```text
Before:                              After:
┌─────────────────────────┐         ┌─────────────────────────┐
│ Overheads    [primary]  │         │ Overheads    [muted]    │  ← Uniform neutral
│   ├─ Director [primary] │         │   ├─ Director [primary] │  ← Tinted child
│   └─ Manager  [primary] │         │   └─ Manager  [primary] │  ← Tinted child
├─────────────────────────┤         ├─────────────────────────┤
│ Clinical     [primary]  │         │ Clinical     [muted]    │  ← Same neutral
│   ├─ RN       [primary] │         │   ├─ RN       [primary] │  ← Tinted child
│   └─ Lead     [primary] │         │   └─ Lead     [primary] │  ← Tinted child
├─────────────────────────┤         ├─────────────────────────┤
│ Support      [primary]  │         │ Support      [muted]    │  ← Same neutral
│   └─ PCT      [primary] │         │   └─ PCT      [primary] │  ← Tinted child
└─────────────────────────┘         └─────────────────────────┘
```

---

## Technical Changes

**File: `src/pages/staffing/PositionPlanning.tsx`**

### 1. Update GroupRow Component (Line 364)

Change the group row background from `bg-primary/5` to `bg-muted/40`:

```typescript
// Before
className="font-semibold bg-primary/5 hover:bg-primary/10 ..."

// After
className="font-semibold bg-muted/40 hover:bg-muted/50 ..."
```

### 2. Keep SkillRow (Child Rows) Styling (Line 424-426)

The child rows already have distinct styling - keep `bg-primary/5`:

```typescript
// Keep as-is (already distinct from new group header color)
isChildRow && "bg-primary/5"
```

### 3. Optionally Enhance TotalRow (Line 477)

Make the total row slightly more prominent:

```typescript
// Before
className="font-semibold bg-muted/20 border-t-2"

// After
className="font-semibold bg-muted/50 border-t-2"
```

---

## Summary

| Change | Location | Description |
|--------|----------|-------------|
| GroupRow background | Line 364 | `bg-primary/5 hover:bg-primary/10` → `bg-muted/40 hover:bg-muted/50` |
| GroupRow border | Line 364 | `border-primary/20` → `border-muted-foreground/30` (neutral) |
| TotalRow background | Line 477 | `bg-muted/20` → `bg-muted/50` (optional enhancement) |

This creates clear visual separation where:
- All three skill category headers look **identical** (neutral/muted)
- Expanded child rows are **tinted** with the primary color
- The total row stands out as the **summary**

