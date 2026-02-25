

## Auto-Adjust Layout for Permission Cards

### Problem
The Role Detail View has a hardcoded two-column layout where the left column contains only 2 cards (Modules, Sub-filters) and the right column contains 4 cards (Settings, Filters, Approvals, Support). This creates a visually unbalanced layout with wasted space on the left.

### Solution
Replace the hardcoded two-column split with a CSS `columns` layout (newspaper-style masonry) that automatically distributes permission cards across columns based on their content height. Cards will flow naturally to fill available space evenly.

### Changes

**File: `src/components/admin/RoleDetailView.tsx`**

1. Remove the two separate `<div>` wrappers for left and right columns
2. Replace `grid grid-cols-2 gap-3` with CSS `columns-2` layout
3. Render all 6 `CompactPermissionCard` components as siblings in a single container, each with `break-inside-avoid` to prevent cards from splitting across columns

The layout will change from:
```text
+------------------+------------------+
| Left div         | Right div        |
|  - Modules       |  - Settings      |
|  - Sub-filters   |  - Filters       |
|                  |  - Approvals     |
|  (empty space)   |  - Support       |
+------------------+------------------+
```

To an auto-balanced flow:
```text
+------------------+------------------+
| Modules          | Settings         |
| Sub-filters      | Filters          |
| Approvals        | Support          |
+------------------+------------------+
```

Cards will automatically rebalance whenever permissions are added or removed from any category.
