

## Fix: Tour Guide Triggers on Every Login

### Root Cause

Two problems:

1. **No fallback in AppContent**: The onboarding check at line 69 does `!data.onboarding_completed` on the raw NestJS `/auth/me` response. If the API doesn't return this field (or returns `null`/`undefined`), this evaluates to `true` → tour always starts.

2. **Write/read mismatch**: `markOnboardingComplete` writes `onboarding_completed: true` directly to Supabase's `profiles` table, but the NestJS API may not serve this field back. So even after marking complete, the next `/auth/me` call still returns without the flag.

### Fix

**File: `src/App.tsx`** (lines 66-77)

Add the same safety fallback used in `useUserProfile`: treat missing/null `onboarding_completed` as `true` (already onboarded). Also check for the camelCase variant (`onboardingCompleted`) since NestJS may use that.

```ts
const checkOnboarding = async () => {
  try {
    const data = await apiFetch("/auth/me");
    const completed = data?.onboarding_completed ?? data?.onboardingCompleted ?? true;
    if (!completed) {
      startFullTour();
      markOnboardingComplete(user.id);
    } else {
      setOnboardingChecked(true);
    }
  } catch {
    setOnboardingChecked(true);
  }
};
```

One file, ~2 lines changed. This ensures that if the NestJS API doesn't explicitly return `onboarding_completed: false`, the tour won't trigger.

