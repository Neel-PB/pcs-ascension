

## RBAC-Gate Guides, Overlays, and Global Feedback

### Problem

The User Guides tab and the floating Feedback button/panel ignore RBAC permissions. A Director (who lacks `admin.access`, `feedback.access`, etc.) can see Admin guides, Feedback guides, and the global Feedback trigger.

### Changes

| File | Change |
|------|--------|
| `src/components/support/UserGuidesTab.tsx` | Import `useRBAC`. Filter `guideCatalog` entries based on module permissions before rendering. Hide categories that have zero visible guides. |
| `src/App.tsx` | Import `useRBAC`. Only render `FeedbackTrigger` and `FeedbackPanel` when the user has `feedback.access`. |

### Permission Mapping for Guides

Each guide category maps to a permission key:

```text
Staffing   -> staffing.access
Positions  -> positions.access
Admin      -> admin.access
Feedback   -> feedback.access
Analytics  -> analytics.access
Reports    -> reports.access
Overlays   -> per-item check (feedback overlay -> feedback.access, others always visible)
```

### Technical Details

1. **UserGuidesTab.tsx**: Add a `categoryPermissionMap` that maps category names to permission keys. In the `guidesWithSteps` memo, filter out guides where the user lacks the required permission. For the "Overlays" category, check individual tourKeys (e.g., `feedback` overlay requires `feedback.access`; `ai-hub`, `checklist`, `header`, `sidebar` remain visible to all). Filter the `categories` array so empty tabs are hidden entirely.

2. **App.tsx**: Create a small wrapper or add `useRBAC()` to `AppContent`. Gate `FeedbackTrigger` and `FeedbackPanel` behind `hasPermission('feedback.access')`.

