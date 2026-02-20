

## Stop Tour Auto-Starting on Every Page Visit

### Problem

The tour auto-starts every time you navigate to a new page or tab because it relies on `localStorage` flags (`helix-tour-{key}-completed`). These flags are browser-specific, easily cleared, and not tied to the user's account. The intended behavior is:

- **First login ever**: Full guided tour runs automatically
- **All subsequent visits**: Tours only run when explicitly launched from the user menu or Support page

### Solution

1. Add an `onboarding_completed` boolean column to the `profiles` table (default `false`)
2. Replace the `localStorage`-based auto-start check with a database-backed check
3. After the first tour completes (or is skipped), set `onboarding_completed = true` in the database
4. Keep `localStorage` flags for tracking individual section completion within a single tour session, but remove the auto-start behavior based on them

### Files to Change

| File | Change |
|------|--------|
| **Database migration** | Add `onboarding_completed boolean DEFAULT false` to `profiles` table. Set `true` for all existing users so they don't get re-toured. |
| `src/hooks/useTour.ts` | Remove the auto-start `useEffect` (lines 30-41). Tours will only run when explicitly triggered via the store (`activeTour` match or `?tour=true` query param). |
| `src/hooks/useUserProfile.ts` | The profile query already uses `SELECT *`, so the new column will be available automatically. |
| `src/contexts/AuthContext.tsx` | After login, check `profile.onboarding_completed`. If `false`, call `startFullTour()` and then mark it `true` in the database. |
| `src/stores/useTourStore.ts` | Add a `markOnboardingComplete` action that updates the database flag via a Supabase call and sets local state. Wire this into `skipAllTours` and into tour completion flow. |

### Detailed Logic

**On login (AuthContext or AppContent):**
```text
1. User authenticates
2. Fetch profile (already happening)
3. If profile.onboarding_completed === false:
   - Call startFullTour()
   - After tour finishes or is skipped, UPDATE profiles SET onboarding_completed = true
4. If profile.onboarding_completed === true:
   - Do nothing (user launches tours manually)
```

**In useTour.ts:**
```text
REMOVE the auto-start useEffect entirely.
KEEP the activeTour match effect (for manual triggers).
KEEP the ?tour=true effect (for cross-page navigation during a tour).
```

**Database migration:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN onboarding_completed boolean DEFAULT false;

-- Mark all existing users as completed so they don't get re-toured
UPDATE public.profiles SET onboarding_completed = true;
```

### What Stays the Same

- Manual tour triggers from the user menu ("Tour This Page", "Full Guided Tour", "All Tours") continue to work exactly as before
- The `?tour=true` query param for cross-page tour navigation still works
- Micro-tours from the Support page still work
- `localStorage` flags still track which sections are done within a running tour session

