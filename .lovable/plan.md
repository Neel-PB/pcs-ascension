

## Fix: Support Both Local Dev and Lovable Preview

### The Problem
The `.env` file serves both your local dev and Lovable's cloud preview. `localhost` works locally but not in Lovable preview. The deployed URL works in preview but you want local for dev.

### Solution
Hardcode the deployed URL as a **fallback** in `apiFetch.ts`. The `.env` value takes priority, so:
- Locally: set `VITE_API_BASE_URL=http://127.0.0.1:8080` in your `.env` — it works
- Lovable preview: if the env var points to localhost or is empty, fall back to the deployed URL

### Changes

**`src/lib/apiFetch.ts`** — Add localhost detection + fallback
```ts
const DEPLOYED_API = "https://ascension-api-213151693504.us-central1.run.app";
const envUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// If env points to localhost but we're running in a non-localhost origin, use deployed URL
const isLocalApi = envUrl.includes("127.0.0.1") || envUrl.includes("localhost");
const isLocalOrigin = typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE_URL = (isLocalApi && !isLocalOrigin) ? DEPLOYED_API : (envUrl || DEPLOYED_API);
```

**`.env`** — Set back to localhost for your local dev
```
VITE_API_BASE_URL=http://127.0.0.1:8080
```

### Result
- Your local dev hits `localhost:8080`
- Lovable preview automatically uses the deployed URL
- No manual env switching needed

