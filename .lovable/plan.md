

## Add "Sign in with Microsoft" (MSAL) Authentication

### Prerequisites: Azure App Registration (You Do This First)

Before I can implement anything, you'll need to create an app in the Microsoft Azure Portal. Here's a step-by-step guide:

1. Go to [Azure Portal](https://portal.azure.com) and sign in with your Ascension admin account
2. Navigate to **Azure Active Directory** (or **Microsoft Entra ID**) > **App registrations** > **New registration**
3. Fill in:
   - **Name**: "Position Control Dashboard" (or any name you prefer)
   - **Supported account types**: Choose "Accounts in this organizational directory only" (single tenant for Ascension) or "Accounts in any organizational directory" (multi-tenant)
   - **Redirect URI**: Select "Single-page application (SPA)" and enter your app URL: `https://pcs-ascension.lovable.app/auth` (and also `https://id-preview--b75aea96-d1cc-459d-b9c8-b92e13fbd2e9.lovable.app/auth` for testing)
4. After registration, copy the **Application (client) ID** and **Directory (tenant) ID** from the Overview page
5. Share those two values with me when ready

### Implementation Plan

Once you have the Client ID and Tenant ID, here's what I'll build:

#### 1. Install MSAL and add configuration
- Install `@azure/msal-browser` package
- Create `src/config/msalConfig.ts` with your Client ID, Tenant ID, and redirect URI

#### 2. Create MSAL utility module
- Create `src/lib/msalAuth.ts` that initializes the MSAL `PublicClientApplication` instance
- Handle the redirect flow (popup or redirect-based login)

#### 3. Create backend function to link Microsoft users
- Create an edge function `msal-auth` that:
  - Receives the Microsoft ID token after login
  - Verifies the token
  - Checks if a user with that email already exists in the database
  - If yes: signs them in via the existing account
  - If no: creates a new account and profile, then signs them in
  - Returns a session token

#### 4. Add "Sign in with Microsoft" button to AuthPage
- Add a Microsoft-branded button below the existing Sign In form (with a divider "or")
- On click: triggers the MSAL popup/redirect flow
- On success: calls the backend function to get a session, then navigates to the dashboard

#### 5. Update AuthContext
- Add a `signInWithMicrosoft` method to the AuthContext so it's available app-wide

### Technical Details

```text
Flow:
  User clicks "Sign in with Microsoft"
       |
  MSAL popup opens -> Microsoft login
       |
  Microsoft returns ID token to app
       |
  App calls edge function with ID token
       |
  Edge function verifies token, finds/creates user
       |
  Returns Supabase session -> user is logged in
```

**Files to create:**
- `src/config/msalConfig.ts` -- MSAL configuration
- `src/lib/msalAuth.ts` -- MSAL client initialization and login helper
- `supabase/functions/msal-auth/index.ts` -- Backend token verification and user linking

**Files to modify:**
- `src/contexts/AuthContext.tsx` -- Add `signInWithMicrosoft` method
- `src/pages/AuthPage.tsx` -- Add Microsoft sign-in button
- `package.json` -- Add `@azure/msal-browser` dependency

### What You Need To Do
1. Complete the Azure App Registration steps above
2. Come back and share the **Client ID** and **Tenant ID**
3. I'll then implement everything

