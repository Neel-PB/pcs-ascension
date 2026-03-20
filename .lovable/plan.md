

## Multi-Step Login Flow

### The Workflow
The login page becomes a single-card, step-by-step flow — no tabs, no signup form, no demo login panel.

**Step 1 — Email only**
- Single email input + "Continue" button
- On submit, call NestJS `GET /auth/check-email?email=xxx`

**Step 2a — Unauthorized**
- If API returns `{ exists: false }`: show error message "You are not authorized. Contact pcssupport@particleblack.com"

**Step 2b — Registered user (has password)**
- If `{ exists: true, registered: true }`: show password input + "Sign In" button
- Calls `POST /auth/login`

**Step 2c — Unregistered user (admin created, no password yet)**
- If `{ exists: true, registered: false }`: show "Create Password" + "Confirm Password" inputs + "Set Password" button
- Calls `POST /auth/set-initial-password` (or `/auth/register-password`) with email + password

### NestJS Endpoints Needed

```text
GET /auth/check-email?email=user@example.com
Returns: { exists: boolean, registered: boolean }
- exists: true if user record exists in DB (admin added them)
- registered: true if user has a password_hash set

POST /auth/set-initial-password
Body: { email, password }
- Only works if user exists but has no password yet
- Hashes password, sets must_change_password=false
- Returns { access_token, user }
```

### Frontend Changes

**`src/pages/AuthPage.tsx`** — Full rewrite
- Remove Tabs, SignUp form, DemoLogin card
- State machine: `step = 'email' | 'unauthorized' | 'password' | 'setup'`
- Step email: email input + Continue button, calls check-email API
- Step unauthorized: error card with support email
- Step password: email (readonly) + password input + Sign In button
- Step setup: email (readonly) + password + confirm password + Set Password button
- Microsoft SSO button stays at the top
- Back button to return to email step from any sub-step

**`src/contexts/AuthContext.tsx`** — Add `checkEmail` and `setInitialPassword` methods
- `checkEmail(email)`: calls `GET /auth/check-email?email=...`, returns `{ exists, registered }`
- `setInitialPassword(email, password)`: calls `POST /auth/set-initial-password`, stores JWT + user

**No other files change** — DemoLogin component stays but is no longer rendered on AuthPage.

### NestJS Prompt for Your Team

```text
GET /auth/check-email?email=user@domain.com
  - Look up user by email in users table
  - Return { exists: boolean, registered: boolean }
  - registered = true if password_hash is NOT NULL
  - No auth required (public endpoint)

POST /auth/set-initial-password
  Body: { email, password }
  - Find user by email
  - If user doesn't exist → 404
  - If user already has password_hash → 409 "Already registered"
  - Hash password with bcrypt, save to password_hash
  - Set must_change_password = false
  - Sign JWT, return { access_token, user }
```

