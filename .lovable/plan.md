

## Fix: Handle empty JSON response in `lookupOverrideByKey`

### Problem
The external API at `/position-overrides/key/{positionKey}` returns HTTP 200 with an empty body when no override exists (instead of 404). Calling `.json()` on an empty response throws `SyntaxError: Unexpected end of JSON input`, which causes the "Failed to add comment" error.

### Solution
**File: `src/hooks/usePositionComments.ts`** — Update `lookupOverrideByKey` (lines 41-46) to safely parse the response body:

1. Read the response as text first
2. If the text is empty, return `null` (no override found)
3. Only parse as JSON if there's actual content

```ts
async function lookupOverrideByKey(positionKey: string, headers: Record<string, string>) {
  const res = await fetch(`${API_BASE_URL}/position-overrides/key/${encodeURIComponent(positionKey)}`, { headers });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Override lookup failed: ${res.status}`);
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}
```

This single change fixes both the query (fetching comments) and mutation (adding comments) paths since both call `lookupOverrideByKey`.

