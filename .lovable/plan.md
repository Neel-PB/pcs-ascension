

## MSAL Integration (Frontend-Only, No Lovable Cloud)

Since you're using your own PostgreSQL + NestJS backend, I'll implement MSAL entirely on the frontend side and have it call your NestJS API for token verification.

### What I'll Build

#### 1. Install `@azure/msal-browser`
- Add the MSAL browser SDK package

#### 2. Create `src/config/msalConfig.ts`
- Read `VITE_MSAL_CLIENT_ID` and `VITE_MSAL_TENANT_ID` from environment variables (placeholders for now)
- Configure authority, redirect URI, cache settings
- Export login request with scopes: `openid`, `profile`, `email`, `User.Read`

#### 3. Create `src/lib/msalAuth.ts`
- Initialize `PublicClientApplication` singleton
- `loginWithMicrosoft()` function — popup-based login with redirect fallback
- Returns the Microsoft `idToken` plus parsed user info (email, name)

#### 4. Update `src/contexts/AuthContext.tsx`
- Add `signInWithMicrosoft()` method that:
  1. Calls `loginWithMicrosoft()` to get the Microsoft ID token
  2. Sends the token to your NestJS API endpoint (configurable via `VITE_API_BASE_URL`)
  3. Receives back a session/JWT from your API
  4. Stores it and sets the user state

#### 5. Update `src/pages/AuthPage.tsx`
- Add a divider ("or") below the Sign In form
- Add a "Sign in with Microsoft" button with Microsoft branding
- Wire it to `signInWithMicrosoft()` with loading/error handling

#### 6. No backend edge functions
- Skipping the edge function entirely — your NestJS API handles token verification

---

### What You Need to Build in NestJS

After I finish the frontend, here's what your NestJS API needs:

**Endpoint**: `POST /auth/msal`

**Request body**:
```json
{ "idToken": "eyJ..." }
```

**What it should do**:
1. Verify the Microsoft ID token signature using Microsoft's JWKS endpoint:
   `https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys`
2. Validate claims: `aud` matches your Client ID, `iss` matches your tenant, token not expired
3. Extract `preferred_username` (email), `given_name`, `family_name`
4. Find or create user in your PostgreSQL database by email
5. Return your app's JWT/session token

**NestJS packages needed**:
- `jwks-rsa` — fetch Microsoft's public signing keys
- `jsonwebtoken` — verify the ID token
- Or use `passport-azure-ad` for a more integrated approach

**Response format** (suggestion — I'll match whatever you use):
```json
{
  "access_token": "your-jwt",
  "user": { "id": "...", "email": "...", "firstName": "...", "lastName": "..." }
}
```

---

### Environment Variables (Placeholders)
- `VITE_MSAL_CLIENT_ID` — your Azure App Client ID
- `VITE_MSAL_TENANT_ID` — your Azure Tenant ID
- `VITE_API_BASE_URL` — your NestJS API URL (e.g. `https://api.yourapp.com`)

### Files to Create
- `src/config/msalConfig.ts`
- `src/lib/msalAuth.ts`

### Files to Modify
- `src/contexts/AuthContext.tsx` — add `signInWithMicrosoft` method
- `src/pages/AuthPage.tsx` — add Microsoft sign-in button

