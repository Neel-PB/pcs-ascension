

# Rename Access Control to RBAC and Set Default View

## Overview

Rename the "Access Control" tab and page header to "RBAC" (Role-Based Access Control) and make the Detail view the default layout instead of Matrix view.

---

## Changes Required

### File 1: `src/pages/admin/AdminPage.tsx`

**Change tab label (line 27):**
```tsx
// FROM:
{ id: "access-control", label: "Access Control", icon: Shield },

// TO:
{ id: "access-control", label: "RBAC", icon: Shield },
```

---

### File 2: `src/pages/admin/AccessControlPage.tsx`

**Change default view mode (line 25):**
```tsx
// FROM:
const [viewMode, setViewMode] = useState<ViewMode>("matrix");

// TO:
const [viewMode, setViewMode] = useState<ViewMode>("detail");
```

**Update page header title (line 88):**
```tsx
// FROM:
<h3 className="text-lg font-semibold">Access Control</h3>

// TO:
<h3 className="text-lg font-semibold">RBAC</h3>
```

---

## Files Summary

| File | Change |
|------|--------|
| `src/pages/admin/AdminPage.tsx` | Change tab label from "Access Control" to "RBAC" |
| `src/pages/admin/AccessControlPage.tsx` | Change default view to "detail", update header to "RBAC" |

---

## Result

- The admin navigation tab will display "RBAC" instead of "Access Control"
- The page header will show "RBAC"
- The Detail view (role list sidebar with permission cards) will be the default layout when opening the page
- Users can still switch between Matrix, Detail, and List views using the toggle buttons

