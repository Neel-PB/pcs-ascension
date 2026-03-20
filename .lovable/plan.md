

## Remove Hardcoded Deployed URL from apiFetch.ts

### Change
**`src/lib/apiFetch.ts`** — Remove `DEPLOYED_API` constant and simplify to only use the env variable. If no env var is set, API calls will simply fail (no silent fallback to a hardcoded URL).

```ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem("nestjs_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data as T;
}
```

Removes the `DEPLOYED_API` constant, `isLocalApi`, `isLocalOrigin`, and all fallback logic. The app uses exactly what `VITE_API_BASE_URL` is set to — nothing else.

