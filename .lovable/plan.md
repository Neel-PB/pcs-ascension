

## Fix: Activity comment logs not rendering beautifully in Positions module

### Root Cause

The NestJS API uses **camelCase** field names (e.g., `commentType`, `createdBy`), but the mapping in `usePositionComments.ts` (line 85) reads `c.comment_type` (snake_case) — which is `undefined`, so it falls back to `'comment'`. This means **all** activity logs (`activity_fte`, `activity_shift`) are treated as plain text comments instead of rendering with the structured FTE/Shift change cards.

Similarly, the metadata fields inside the API response are likely camelCase (`fteOld`, `fteNew`, `shiftOld`) instead of snake_case (`fte_old`, `fte_new`, `shift_old`), so the `FteActivityCard` and `ShiftActivityCard` components read `undefined` values.

### Changes

**File: `src/hooks/usePositionComments.ts`** — Fix the field mapping from API response (around line 78-88):

```ts
return {
  id: c.id,
  position_id: positionId,
  user_id: c.created_by || c.createdBy,
  content: c.text,
  created_at: c.created_at || c.createdAt,
  updated_at: c.created_at || c.createdAt,
  comment_type: c.comment_type || c.commentType || 'comment',
  metadata: c.metadata ?? null,
  profiles: profile,
} as PositionComment;
```

**File: `src/components/positions/PositionCommentSection.tsx`** — Update `FteActivityCard` and `ShiftActivityCard` to handle both camelCase and snake_case metadata keys:

- `FteActivityCard`: Read both `fte_old`/`fteOld`, `fte_new`/`fteNew`, `reason_old`/`reasonOld`, `expiry_old`/`expiryOld`, etc.
- `ShiftActivityCard`: Read both `shift_old`/`shiftOld`, `shift_new`/`shiftNew`, `is_revert`/`isRevert`.

This ensures the structured activity cards render correctly regardless of the API's casing convention.

