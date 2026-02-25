

## Add FAQ Management with RBAC Permission

### Overview
Add a new `support.add_faq` permission to the RBAC system. Users with this permission will see an "Add FAQ" button on the FAQs tab. Clicking it opens a dialog form to submit a new FAQ (question + answer), which gets saved to a new `faqs` database table. All users can read FAQs; only permitted users can create them.

### Database Changes

**1. Create `faqs` table**

```text
faqs
+-------------+---------------------------+
| id          | uuid (PK, auto-generated) |
| question    | text (NOT NULL)           |
| answer      | text (NOT NULL)           |
| created_by  | uuid (NOT NULL)           |
| created_at  | timestamptz (default now) |
| updated_at  | timestamptz (default now) |
+-------------+---------------------------+
```

RLS policies:
- SELECT: all authenticated users
- INSERT: authenticated users (created_by = auth.uid())
- UPDATE/DELETE: only the creator or admins

**2. Insert `support.add_faq` permission into `permissions` table**

Insert a new row:
- key: `support.add_faq`
- label: "Add FAQ"
- description: "Ability to create FAQ entries"
- category: "support"
- is_system: true

### Code Changes

| File | Change |
|------|--------|
| `src/config/rbacConfig.ts` | Add `support.add_faq` permission to CORE_PERMISSIONS, PERMISSION_CATEGORIES (new "support" category), PermissionKey type, and grant it to `admin` and `labor_team` defaults |
| `src/pages/support/SupportPage.tsx` | Import `useRBAC`, fetch FAQs from DB via React Query, merge with hardcoded defaults, add "Add FAQ" button (visible only when `hasPermission('support.add_faq')`), add Dialog form for creating new FAQ |

### UI Behavior

1. FAQs tab loads hardcoded FAQs plus any DB FAQs (DB FAQs shown first)
2. Users with `support.add_faq` permission see an "Add FAQ" button next to the search bar
3. Clicking "Add FAQ" opens a dialog with:
   - Question field (Input, required)
   - Answer field (Textarea, required)
   - Cancel and Submit buttons
4. On submit: insert into `faqs` table, invalidate query cache, show success toast
5. Search filters apply across both hardcoded and DB FAQs

### Technical Details

- New hook or inline query: `useQuery(['faqs'], ...)` to fetch from `faqs` table
- Mutation: `useMutation` to insert new FAQ with `created_by = user.id`
- The permission check uses `useRBAC().hasPermission('support.add_faq')`
- Default role grants: admin and labor_team get `support.add_faq` by default; other roles do not
