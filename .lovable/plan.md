

# Fix: Access Scope Manager Options Not Showing

## Problem Summary

When editing a user in the Admin panel and expanding the "Access Scope Restrictions" section, clicking "+ Add" on Market, Facility, or Department shows an empty dropdown with "No items found". Only Region shows options.

## Root Cause

**RLS Policy Mismatch**: The lookup tables have different RLS policies:
- `regions` table: Policy allows `public` role → Works ✓
- `markets`, `facilities`, `departments` tables: Policies require `authenticated` role → Returns empty array

The network requests confirm this - the API returns `[]` for markets/facilities/departments but returns data for regions.

The `useFilterData` hook's React Query cache may also be stale from before authentication, but the primary issue is the RLS policy.

## Solution

**Option A (Recommended)**: Update RLS policies to allow public read access for lookup tables

These are non-sensitive reference data tables. Making them publicly readable matches the `regions` table pattern and simplifies data access throughout the app.

**Option B**: Make `useFilterData` refetch when auth state changes

Add `session?.access_token` to the query key so it invalidates after login. This is more complex and adds latency.

---

## Implementation (Option A)

### Step 1: Update RLS Policies via Database Migration

Update the SELECT policies on `markets`, `facilities`, and `departments` tables to use `public` instead of `authenticated`:

```sql
-- Update markets policy to allow public read
DROP POLICY IF EXISTS "Markets are viewable by authenticated users" ON markets;
CREATE POLICY "Markets are viewable by everyone" ON markets
  FOR SELECT
  TO public
  USING (true);

-- Update facilities policy to allow public read  
DROP POLICY IF EXISTS "Facilities are viewable by authenticated users" ON facilities;
CREATE POLICY "Facilities are viewable by everyone" ON facilities
  FOR SELECT
  TO public
  USING (true);

-- Update departments policy to allow public read
DROP POLICY IF EXISTS "Departments are viewable by authenticated users" ON departments;
CREATE POLICY "Departments are viewable by everyone" ON departments
  FOR SELECT
  TO public
  USING (true);
```

### Step 2: Invalidate Cached Query (Code Change)

After the policy change, the stale cache won't automatically refresh. Add auth-awareness to `useFilterData` by including the session in the query key.

**File: `src/hooks/useFilterData.ts`**

```typescript
import { useAuthContext } from "@/contexts/AuthContext";

export function useFilterData() {
  const { session } = useAuthContext();
  
  const { data, isLoading } = useQuery({
    // Include session token in key to refetch after login
    queryKey: ["all-filter-data", session?.access_token ? "authenticated" : "anonymous"],
    queryFn: async (): Promise<FilterDataResult> => {
      // ... existing code
    },
    staleTime: 10 * 60 * 1000,
  });
  // ...
}
```

This ensures the query refetches after the user logs in, picking up the new RLS policies.

---

## Secondary Issue: Selected Values Not Highlighted

The user also mentioned selected values should be highlighted. Looking at `MultiSelectChips`, selected items already show:
- A check mark icon on the right
- A light primary background: `isSelected ? "bg-primary/10" : "hover:bg-muted/50"`

However, this might not be visible enough. We can enhance it:

**File: `src/components/ui/multi-select-chips.tsx`**

Increase the visual contrast for selected items:

```typescript
<label
  key={option.value}
  className={cn(
    "flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors",
    isSelected 
      ? "bg-primary/15 border border-primary/30" 
      : "hover:bg-muted/50"
  )}
>
```

---

## Expected Outcome

| Before | After |
|--------|-------|
| Market/Facility/Department dropdowns show "No items found" | All dropdowns show full list of options |
| Selected items have subtle background | Selected items have stronger visual highlight with border |

---

## Technical Summary

| Change | File | Description |
|--------|------|-------------|
| Database Migration | N/A | Update RLS policies to allow public SELECT on lookup tables |
| Code Change | `src/hooks/useFilterData.ts` | Add session awareness to query key for proper cache invalidation |
| UI Enhancement | `src/components/ui/multi-select-chips.tsx` | Stronger visual highlight for selected options |

