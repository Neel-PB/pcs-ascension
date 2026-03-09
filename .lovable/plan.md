

## Fix: FTE and Shift activity logs showing as plain comments

### Problem

The override mutation sends `comment`, `commentType`, and `metadata` in the same PUT/POST body to `/position-overrides`. The NestJS API creates a comment as a side-effect but only stores the `text` — it ignores `commentType` and `metadata`. When comments are fetched back, they come back as plain `comment` type with no metadata, so the UI renders them as regular text bubbles instead of structured activity cards.

### Solution

After a successful FTE or Shift mutation, **post a separate activity comment** via the dedicated comments endpoint (`POST /position-overrides/{overrideId}/comments`) which accepts `commentType` and `metadata`. Remove the `comment`/`commentType`/`metadata` fields from the override PUT/POST body to avoid duplicate plain-text entries.

### Changes

**1. `src/hooks/useUpdateActualFte.ts`**
- Remove `comment`, `commentType`, and `metadata` from the override PUT/POST request body
- In `onSuccess`, post a separate comment via `POST /position-overrides/{overrideId}/comments` with:
  - `text`: "FTE Change" (or the user's comment)
  - `commentType`: "activity_fte"
  - `metadata`: `{ fteOld, fteNew, reasonOld, reasonNew, expiryOld, expiryNew, comment }`
  - `userId`: the current user's ID
- Pass `updatedBy` and previous values through the mutation return so `onSuccess` has them

**2. `src/hooks/useUpdateShiftOverride.ts`**
- Same pattern: remove `comment`/`commentType`/`metadata` from override body
- In `onSuccess`, post a separate comment with:
  - `text`: "Shift Change" or "Shift Reverted"
  - `commentType`: "activity_shift"
  - `metadata`: `{ shiftOld, shiftNew, isRevert }`
  - `userId`: the current user's ID

This ensures the comments endpoint stores `commentType` and `metadata`, which the fetch logic already reads correctly — making structured activity cards (FTE old→new, status, expiry, shift old→new) appear properly in the comments panel.

