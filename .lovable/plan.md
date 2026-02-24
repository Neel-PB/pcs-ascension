

## Default New Feedback to "Pending" for Both Statuses

### Problem
New feedback items currently default to `pending` for ACS status but `in_progress` for PB status. Both should default to `Pending`.

### Changes

#### 1. Database migration
- Change the default value of `pb_status` column from `'in_progress'` to `'pending'`

#### 2. `src/hooks/useFeedback.ts`
- Add `'pending'` to the `pb_status` type union: `'pending' | 'in_progress' | 'resolved' | 'closed'`

#### 3. `src/pages/feedback/FeedbackPage.tsx`
- Add a `Pending` option to the PB Status filter dropdown

### Files Changed
- Database migration (alter column default)
- `src/hooks/useFeedback.ts` -- update type definition
- `src/pages/feedback/FeedbackPage.tsx` -- add Pending filter option

