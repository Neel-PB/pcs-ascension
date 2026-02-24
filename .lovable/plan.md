

## Fix Feedback Comment Counts

### Problem
The comment count column always shows `0` because the `commentCounts` Map in `FeedbackPage.tsx` (line 77) is initialized as an empty Map and never populated with actual data from the database.

### Changes

#### 1. `src/pages/feedback/FeedbackPage.tsx`
- Add a query to fetch comment counts from the `feedback_comments` table, grouped by `feedback_id`
- Replace the empty `useMemo(() => new Map())` with actual data from the query
- Use a single aggregation query: `SELECT feedback_id, count(*) FROM feedback_comments GROUP BY feedback_id`

Since Supabase JS doesn't support raw GROUP BY, we'll fetch all feedback comment rows (just `id` and `feedback_id`) and count client-side, or use an RPC. The simpler approach: fetch minimal comment data and build the map.

**Approach**: Add a dedicated query that fetches `feedback_id` from `feedback_comments` for all current feedback IDs, then count occurrences client-side to build the Map.

### Files Changed
- `src/pages/feedback/FeedbackPage.tsx` -- replace empty commentCounts with a real query

