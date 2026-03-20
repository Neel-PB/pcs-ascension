

## Fix: Set `.env` to localhost

The `.env` file in the Lovable project currently contains:
```
VITE_API_BASE_URL=https://ascension-api-213151693504.us-central1.run.app
```

You want it to be:
```
VITE_API_BASE_URL=http://127.0.0.1:8080
```

### Change
**`.env`** line 4 — change to `http://127.0.0.1:8080`

Note: This will make the Lovable cloud preview fail on API calls (since it can't reach your localhost), but your local dev will work correctly. The `apiFetch.ts` is already correct — it uses exactly what's in the env.

