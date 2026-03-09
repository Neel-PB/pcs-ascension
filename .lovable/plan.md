

## Fix: Activity comment logs showing empty fields (dashes)

### Root Cause

The mutation hooks (`useUpdateActualFte`, `useUpdateShiftOverride`) send `comment` and `commentType` to the API but **never send metadata** containing the old/new values. The API stores the comment without any structured metadata, so when the `FteActivityCard` and `ShiftActivityCard` read `metadata.fte_old`, `metadata.fte_new`, etc., everything is `undefined` → dashes.

Additionally, the profile lookup only checks `c.created_by` (snake_case) but the API likely returns `c.createdBy` (camelCase), causing "Unknown User".

### Changes

**1. `src/hooks/useUpdateActualFte.ts`** — Include metadata in the API request body for both PUT and POST:

```ts
metadata: {
  fteOld: params.previousFte,
  fteNew: params.actual_fte,
  reasonOld: params.previousStatus,
  reasonNew: params.actual_fte_status,
  expiryOld: params.previousExpiry,
  expiryNew: params.actual_fte_expiry,
  comment: params.comment,
},
```

**2. `src/hooks/useUpdateShiftOverride.ts`** — Include metadata in the API request body:

```ts
metadata: {
  shiftOld: shiftOld,
  shiftNew: shiftNew,
  isRevert: isRevert,
},
```

**3. `src/hooks/usePositionComments.ts`** — Fix profile lookup to handle camelCase author IDs + batch into a single query:

```ts
const authorId = c.created_by || c.createdBy || c.userId || c.user_id;
```

Collect all unique author IDs first, fetch profiles in one `.in("id", authorIds)` query, then map back via a `Map`.

Three files, ensures activity cards render with actual change values and correct user names.

