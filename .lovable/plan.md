

## Remove Microsoft Sign-In from Login Page

### Changes

#### 1. `src/pages/AuthPage.tsx`
- Remove the `MicrosoftSignInButton` import (line 13)
- Remove `signInWithMicrosoft` from the `useAuth()` destructure (line 19)
- Remove `isMsalLoading` state (line 26)
- Remove `handleMicrosoftSignIn` function (lines 78-86)
- Remove the Microsoft SSO block on the email step (lines 121-132): the button, separator, and "or" divider

#### 2. Cleanup (optional, no functional impact)
- `src/components/auth/MicrosoftSignInButton.tsx` — can be deleted
- `src/lib/msalAuth.ts` — can be deleted  
- `src/config/msalConfig.ts` — can be deleted
- `signInWithMicrosoft` in `AuthContext.tsx` — can be removed later

### Files Changed
- `src/pages/AuthPage.tsx`

