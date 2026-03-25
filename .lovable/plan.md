

## Migrate FAQs from Supabase to NestJS API

Replace the current Supabase-based FAQ queries with `apiFetch` calls to the new NestJS endpoints.

### Changes — `src/pages/support/SupportPage.tsx`

1. **Remove** the Supabase import and replace FAQ query with `apiFetch('/faqs')` using `useQuery`
2. **Replace** the insert mutation to use `apiFetch('/faqs', { method: 'POST', body: JSON.stringify({ question, answer }) })`
3. **Keep** hardcoded FAQs as fallback, merged after DB FAQs
4. **Optionally** display author info (e.g., "Added by John Doe") on DB FAQs

### Technical Details

- `GET /faqs` returns `{ id, question, answer, created_by, created_at, author: { first_name, last_name, email } }[]`
- `POST /faqs` accepts `{ question: string, answer: string }` — `created_by` is extracted server-side from JWT
- Remove `userId` from the mutation since the backend handles it via token
- No new files needed — single file edit

