

## Make First-Time Onboarding Tour Unskippable

### Changes (3 files, ~10 lines)

**1. `src/stores/useTourStore.ts`**
- Add `isOnboarding: boolean` to state (default `false`)
- `startFullTour()` → also sets `isOnboarding: true`
- `stopTour()` and `skipAllTours()` → reset `isOnboarding: false`

**2. `src/components/tour/TourTooltip.tsx`**
- Read `isOnboarding` from store
- When `true`, hide all skip buttons (Skip All, Skip Section, Skip)

**3. `src/components/tour/OverlayTour.tsx`**
- Read `isOnboarding` from store
- Pass `showSkipButton={!isOnboarding}` to Joyride

### Result
- First-time users must complete the full tour — no skip option
- Manual tours remain skippable
- 3 files, ~10 lines changed

