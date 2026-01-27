

# Improve Permission List View Readability

## Overview

Redesign the Permission List view to be more understandable and user-friendly with:
- Clear category section headers with visual separation
- Better labels that explain what each permission actually does
- Improved visual hierarchy and spacing
- Card-based layout within categories for better scanning

---

## Current Issues

| Problem | Location |
|---------|----------|
| Category badge only shows on first row in each group | Makes grouping unclear |
| Flat table layout | Hard to scan and understand relationships |
| "approvals.feedback" labeled as "Manage Feedback Status" | Doesn't clearly indicate it's for approval workflow |
| Description gets truncated | Users can't see full context |

---

## Solution

### 1. Add Category Section Headers

Replace flat table with grouped sections. Each category gets:
- A sticky header row with category name
- Clear visual separator
- Permission count badge

### 2. Card-Style Rows Within Categories

Each permission row shows:
- Permission label prominently
- Key in smaller monospace font
- Full description (not truncated)
- Assigned roles with expandable view

### 3. Improved Labels and Descriptions

Update the approval permissions to be clearer:

| Current Label | Proposed Label |
|---------------|----------------|
| Manage Feedback Status | Approve/Reject Feedback |
| Approve NP Overrides | Approve NP Override Requests |
| Approve Volume Overrides | Approve Volume Override Requests |

---

## Implementation

### File: `src/components/admin/PermissionListView.tsx`

**1. Add category section headers:**
```tsx
// Instead of flat table, render grouped sections
{sortedCategories.map((category) => {
  const categoryPermissions = groupedPermissions[category] || [];
  if (categoryPermissions.length === 0) return null;
  
  return (
    <div key={category} className="space-y-2">
      {/* Category Header */}
      <div className="flex items-center gap-2 py-3 border-b bg-muted/30 px-4 sticky top-0 z-10">
        <h3 className="text-sm font-semibold">
          {CATEGORY_LABELS[category] || category}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {categoryPermissions.length}
        </Badge>
      </div>
      
      {/* Permission Cards */}
      <div className="divide-y">
        {categoryPermissions.map((permission) => (
          <PermissionCard key={permission.id} permission={permission} />
        ))}
      </div>
    </div>
  );
})}
```

**2. Create a PermissionCard component for better layout:**
```tsx
function PermissionCard({ permission, roles, onEdit, onDelete }) {
  return (
    <div className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          {/* Label + System badge */}
          <div className="flex items-center gap-2">
            <span className="font-medium">{permission.label}</span>
            {permission.is_system && (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          
          {/* Key (monospace, smaller) */}
          <code className="text-xs text-muted-foreground font-mono">
            {permission.key}
          </code>
          
          {/* Full description */}
          <p className="text-sm text-muted-foreground">
            {permission.description || "No description"}
          </p>
        </div>
        
        {/* Assigned Roles */}
        <div className="flex flex-wrap gap-1 max-w-[250px]">
          {assignedRoles.map((role) => (
            <Badge key={role.id} variant="outline" className="text-xs">
              {role.label}
            </Badge>
          ))}
        </div>
        
        {/* Actions */}
        <DropdownMenu>...</DropdownMenu>
      </div>
    </div>
  );
}
```

**3. Sort categories in logical order:**
```tsx
const CATEGORY_ORDER = ["modules", "settings", "filters", "subfilters", "approvals"];

const sortedCategories = useMemo(() => {
  return Object.keys(groupedPermissions).sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    return aIndex - bIndex;
  });
}, [groupedPermissions]);
```

---

## Visual Design

```text
┌────────────────────────────────────────────────────────────────────┐
│  🔍 Search permissions...     │  All Categories ▼                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  MODULE ACCESS                                           (7)       │
│  ────────────────────────────────────────────────────────────────  │
│                                                                    │
│  Admin Module                                    🔒                │
│  admin.access                                                      │
│  Access to the admin panel                                         │
│                                     Admin  Labor Management        │
│                                                                    │
│  ────────────────────────────────────────────────────────────────  │
│                                                                    │
│  APPROVAL ACCESS                                         (5)       │
│  ────────────────────────────────────────────────────────────────  │
│                                                                    │
│  Approve/Reject Feedback                         🔒                │
│  approvals.feedback                                                │
│  Ability to approve, reject, or move feedback items to backlog     │
│                                     Admin  Labor Management        │
│                                                                    │
│  Approve Positions to Open                       🔒                │
│  approvals.positions_to_open                                       │
│  Ability to approve or reject new position requests                │
│                      Admin  Labor Management  Leadership  +2       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Benefits

| Improvement | Impact |
|-------------|--------|
| Category headers always visible | Users immediately understand grouping |
| Full descriptions shown | No truncation, full context available |
| Label shown prominently, key secondary | Focus on what it does, not technical ID |
| Card layout with spacing | Easier to scan and find permissions |
| Permission count per category | Quick overview of category size |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/PermissionListView.tsx` | Complete redesign with category sections and card-style permission rows |

