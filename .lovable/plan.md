

# Add Approval Workflow Permissions

## Overview

Add a new "approvals" category with granular permissions to control who can approve/reject position changes, forecast actions, and override requests. These permissions will be enforced in the UI to hide/disable approval buttons and in hooks to prevent unauthorized actions.

---

## New Permissions to Add

### Approvals Category

| Permission Key | Label | Description |
|----------------|-------|-------------|
| `approvals.positions_to_open` | Approve Positions to Open | Ability to approve or reject new position requests |
| `approvals.positions_to_close` | Approve Positions to Close | Ability to approve or reject position closure requests |
| `approvals.volume_override` | Approve Volume Overrides | Ability to create and modify volume overrides |
| `approvals.np_override` | Approve NP Overrides | Ability to create and modify NP overrides |
| `approvals.feedback` | Manage Feedback Status | Ability to approve, disregard, or backlog feedback items |

---

## Implementation Steps

### 1. Insert New Permissions into Database
Add the new approval permissions to the `permissions` table with `is_system = true` (core functionality).

### 2. Update Role-Permission Mappings
Configure which roles get these permissions by default:
- **Admin / Labor Team**: All approval permissions
- **Leadership / CNO**: Position approvals (open/close)
- **Director**: Position approvals for their facility scope
- **Manager**: No approval permissions by default

### 3. Update UI Components

**Files to modify:**

- `src/components/staffing/ApprovalButtons.tsx` - Add `disabled` prop that checks permission
- `src/components/workforce/PositionToOpenDetailsSheet.tsx` - Add approval buttons to footer (currently missing), check permission
- `src/components/workforce/PositionToCloseDetailsSheet.tsx` - Add approval buttons to footer, check permission
- `src/components/staffing/PositionBreakdownRow.tsx` - Conditionally show/hide based on permission
- `src/components/feedback/FeedbackTableRow.tsx` - Disable PCS status dropdown if no permission
- `src/components/feedback/FeedbackDetailsSheet.tsx` - Disable status changes if no permission
- `src/pages/staffing/SettingsTab.tsx` - Check override permissions before allowing edits
- `src/pages/staffing/NPSettingsTab.tsx` - Check NP override permissions before allowing edits

### 4. Update Hooks with Permission Checks

**Files to modify:**

- `src/hooks/useForecastPositions.ts` - Add permission check before mutations
- `src/hooks/useVolumeOverrides.ts` - Add permission check before upsert/delete
- `src/hooks/useNPOverrides.ts` - Add permission check before upsert/delete
- `src/hooks/useFeedback.ts` - Add permission check for status updates

### 5. Update Config and Category Labels

**Files to modify:**

- `src/config/rbacConfig.ts` - Add approvals category and permission definitions
- `src/pages/admin/PermissionsManagement.tsx` - Add "Approvals" to category labels

---

## Technical Details

### Database Migration

```sql
-- Insert approval permissions
INSERT INTO public.permissions (key, label, description, category, is_system) VALUES
  ('approvals.positions_to_open', 'Approve Positions to Open', 'Ability to approve or reject new position requests', 'approvals', true),
  ('approvals.positions_to_close', 'Approve Positions to Close', 'Ability to approve or reject position closure requests', 'approvals', true),
  ('approvals.volume_override', 'Approve Volume Overrides', 'Ability to create and modify volume overrides', 'approvals', true),
  ('approvals.np_override', 'Approve NP Overrides', 'Ability to create and modify NP overrides', 'approvals', true),
  ('approvals.feedback', 'Manage Feedback Status', 'Ability to approve, disregard, or backlog feedback items', 'approvals', true);

-- Set default role permissions for approvals
INSERT INTO public.role_permissions (role, permission_key, permission_value) VALUES
  -- Admin gets all approvals (via defaults, but explicit for clarity)
  ('admin', 'approvals.positions_to_open', true),
  ('admin', 'approvals.positions_to_close', true),
  ('admin', 'approvals.volume_override', true),
  ('admin', 'approvals.np_override', true),
  ('admin', 'approvals.feedback', true),
  -- Labor team gets all approvals
  ('labor_team', 'approvals.positions_to_open', true),
  ('labor_team', 'approvals.positions_to_close', true),
  ('labor_team', 'approvals.volume_override', true),
  ('labor_team', 'approvals.np_override', true),
  ('labor_team', 'approvals.feedback', true),
  -- Leadership gets position approvals only
  ('leadership', 'approvals.positions_to_open', true),
  ('leadership', 'approvals.positions_to_close', true),
  -- CNO gets position approvals only
  ('cno', 'approvals.positions_to_open', true),
  ('cno', 'approvals.positions_to_close', true),
  -- Director gets position approvals for their scope
  ('director', 'approvals.positions_to_open', true),
  ('director', 'approvals.positions_to_close', true);
```

### Permission Check Pattern

Components will use the `useRBAC` hook to check permissions:

```typescript
const { hasPermission } = useRBAC();
const canApprovePositions = hasPermission('approvals.positions_to_open');

// In UI
<ApprovalButtons 
  status={position.status}
  onApprove={handleApprove}
  onReject={handleReject}
  disabled={!canApprovePositions}
/>
```

### Hook-Level Enforcement

Mutations will verify permissions before executing:

```typescript
export function useApprovePositionToOpen() {
  const { hasPermission } = useRBAC();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!hasPermission('approvals.positions_to_open')) {
        throw new Error('You do not have permission to approve positions');
      }
      // ... existing logic
    },
  });
}
```

---

## Files Summary

### New/Created
- Database migration for new permissions

### Modified
| File | Change |
|------|--------|
| `src/config/rbacConfig.ts` | Add approvals category with 5 new permission keys |
| `src/pages/admin/PermissionsManagement.tsx` | Add "Approvals" label to category map |
| `src/components/staffing/ApprovalButtons.tsx` | Already supports `disabled` prop - no change needed |
| `src/components/workforce/PositionToOpenDetailsSheet.tsx` | Add approval buttons and permission check |
| `src/components/workforce/PositionToCloseDetailsSheet.tsx` | Add approval buttons and permission check |
| `src/components/feedback/FeedbackTableRow.tsx` | Add permission check for PCS status dropdown |
| `src/components/feedback/FeedbackDetailsSheet.tsx` | Add permission check for status dropdown |
| `src/hooks/useForecastPositions.ts` | Add permission validation to approval mutations |
| `src/hooks/useVolumeOverrides.ts` | Add permission check to upsert/delete mutations |
| `src/hooks/useNPOverrides.ts` | Add permission check to upsert/delete mutations |
| `src/hooks/useFeedback.ts` | Add permission check for status update mutations |

---

## User Experience

1. **Admins/Labor Team**: Full access to all approval actions across all modules
2. **Leadership/CNO/Director**: Can approve position changes within their organizational scope
3. **Manager**: Cannot approve positions by default (can be enabled via role configuration)
4. **All users**: Will see approval buttons as disabled/hidden if they lack permission
5. **Permission changes**: Take effect immediately via real-time subscriptions

