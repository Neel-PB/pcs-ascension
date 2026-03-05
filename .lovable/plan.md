

## Rewire Position Overrides & Comments to NestJS API

Your NestJS API is complete with all 12 endpoints. Now the frontend needs to switch from Supabase direct writes to this API.

### Architecture Summary

```text
Current:  usePositionsByFlag → NestJS /positions (read)
          useUpdateActualFte → Supabase positions table (write)
          useUpdateShiftOverride → Supabase positions table (write)
          useAddActivityLog → Supabase position_comments (write)
          usePositionComments → Supabase position_comments (read/write)
          usePositionCommentCounts → Supabase position_comments (read)
          useCheckExpiredFte → Supabase edge function

New:      usePositionsByFlag → NestJS /positions (read) + /position-overrides (merge)
          useUpdateActualFte → NestJS POST/PUT /position-overrides
          useUpdateShiftOverride → NestJS POST/PUT /position-overrides
          useAddActivityLog → DELETED (API handles comments inline)
          usePositionComments → NestJS /position-overrides/:id/comments
          usePositionCommentCounts → NestJS POST /position-overrides/comment-counts
          useCheckExpiredFte → NestJS POST /position-overrides/check-expired
```

### Files to Change (7 files)

**1. `src/hooks/usePositionsByFlag.ts`** — Merge overrides into API data
- After fetching base positions, also `GET /api/position-overrides` (all overrides, paginated)
- Build a `Map<positionKey, override>` and overlay `actual_fte`, `actual_fte_expiry`, `actual_fte_status`, `actual_fte_shared_*`, `shift_override` onto each normalized row
- Store `overrideId` on each row so update hooks know whether to POST (create) or PUT (update)

**2. `src/hooks/useUpdateActualFte.ts`** — Switch to NestJS API
- Remove Supabase import and `useAddActivityLog` dependency
- If position has `overrideId`: `PUT /api/position-overrides/:overrideId` with FTE fields + `comment` + `commentType: 'activity_fte'`
- If no `overrideId`: `POST /api/position-overrides` with `positionKey` + FTE fields + `initialComment`
- Keep the same cache update logic for `['positions']` queries
- Add `overrideId` to params interface

**3. `src/hooks/useUpdateShiftOverride.ts`** — Switch to NestJS API
- Same POST/PUT pattern based on `overrideId`
- Send `shiftOverride` + `comment` + `commentType: 'activity_shift'`
- Remove Supabase import and `useAddActivityLog`

**4. `src/hooks/usePositionComments.ts`** — Switch all 4 hooks to NestJS API
- `usePositionComments(positionId)`: First look up override by position key via `GET /api/position-overrides/key/:positionKey`, then `GET /api/position-overrides/:id/comments`. Map response fields (`text` → `content`, `created_by` → `user_id`). Still fetch profiles from Supabase for avatar/name display.
- `useAddPositionComment`: `POST /api/position-overrides/:id/comments` with `{ text, commentType: 'manual_note', userId }`
- `useUpdatePositionComment`: `PATCH /api/position-overrides/:overrideId/comments/:commentId` with `{ text }`
- `useDeletePositionComment`: `DELETE /api/position-overrides/:overrideId/comments/:commentId`
- Add `overrideId` parameter to mutation hooks

**5. `src/hooks/usePositionCommentCounts.ts`** — Switch to bulk endpoint
- Replace Supabase batched queries with `POST /api/position-overrides/comment-counts` with `{ positionKeys: [...] }`
- Still batch in groups of 500 for large datasets
- Response is already `{ "POS-123": 5, ... }` — convert to `Map<string, number>`

**6. `src/hooks/useCheckExpiredFte.ts`** — Switch to NestJS API
- Replace `supabase.functions.invoke('check-expired-fte')` with `POST ${API_BASE_URL}/position-overrides/check-expired`
- Include MSAL token in Authorization header
- Parse response `{ reverted, message }`

**7. `src/hooks/useAddActivityLog.ts`** — DELETE this file
- Activity logging is now handled inline by the NestJS API when you include `comment` + `commentType` in the PUT/POST body
- Remove all imports of this hook from other files

### Helper Pattern — API fetch utility
All hooks will share the same pattern for building headers with MSAL token:
```typescript
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const token = sessionStorage.getItem("msal_access_token");
const headers: Record<string, string> = { "Content-Type": "application/json" };
if (token) headers["Authorization"] = `Bearer ${token}`;
```

### Comment Field Mapping (API ↔ Frontend)

| API Response | Frontend Interface |
|---|---|
| `text` | `content` |
| `created_by` | `user_id` |
| `comment_type` | `comment_type` |
| `created_at` | `created_at` |

Profile data (name, avatar) will still be fetched from Supabase `profiles` table using the `created_by` UUID, same as current approach.

### Position Type Update
The `Position` type in `src/types/position.ts` needs an optional `overrideId?: string` field so update hooks know whether to create or update.

