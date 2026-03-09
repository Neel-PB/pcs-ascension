

## Add Shared Position fields to FTE activity logs

### Problem
When a user selects "Shared Position" as the Active FTE status, the override correctly saves `actual_fte_shared_with`, `actual_fte_shared_fte`, and `actual_fte_shared_expiry`. However, these values are **not included** in the activity log comment posted to the comments endpoint, and the `FteActivityCard` component doesn't render them.

### Changes

**1. `src/hooks/useUpdateActualFte.ts`** — Include shared fields in the activity comment JSON:
Add `sharedWith`, `sharedFte`, `sharedExpiry` to the `JSON.stringify` text payload so they're persisted in the comment.

**2. `src/components/positions/PositionCommentSection.tsx`** — Render shared fields in `FteActivityCard`:
- Extract `sharedWith`, `sharedFte`, `sharedExpiry` from metadata
- When reason is "SHARED_POSITION", show additional rows:
  - **Shared With**: position number/name
  - **Shared FTE**: the shared FTE value
  - **Shared Expiry**: formatted date (or "No Expiry" if null since Shared Position has no max)

This ensures the activity log fully captures what was changed when a Shared Position override is applied.

