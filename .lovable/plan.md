

## Fix: API drops `metadata` field — encode activity data in `text`

### Root Cause

The NestJS comments endpoint stores `commentType` correctly but **ignores the `metadata` field entirely**. The activity card renders (correct `comment_type`) but all values show em-dashes because `metadata` is always `null` when fetched back.

### Solution

Encode the structured metadata as a JSON string inside the `text` field. On fetch, detect activity comments and parse `text` as JSON to reconstruct `metadata`.

### Changes

**1. `src/hooks/useUpdateActualFte.ts`** — Encode metadata in `text`:
```ts
text: JSON.stringify({
  fteOld: ..., fteNew: ..., 
  reasonOld: ..., reasonNew: ...,
  expiryOld: ..., expiryNew: ..., 
  comment: ...
}),
commentType: "activity_fte",
// remove metadata field
```

**2. `src/hooks/useUpdateShiftOverride.ts`** — Same pattern:
```ts
text: JSON.stringify({
  shiftOld: ..., shiftNew: ..., isRevert: ...
}),
commentType: "activity_shift",
```

**3. `src/hooks/usePositionComments.ts`** — Parse JSON text for activity comments:
In the mapping step, when `commentType` is `activity_fte` or `activity_shift`, attempt to parse the `text` field as JSON and use it as `metadata`. Fall back to existing `c.metadata` if parsing fails.

```ts
let metadata = c.metadata ?? null;
const commentType = c.comment_type || c.commentType || 'comment';
if ((commentType === 'activity_fte' || commentType === 'activity_shift') && !metadata) {
  try { metadata = JSON.parse(c.text); } catch {}
}
```

This is backward-compatible: existing comments with real metadata still work, and new comments encode metadata in text as a workaround for the API limitation.

