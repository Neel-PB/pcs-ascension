
# Auto-Revert Expired Active FTE Values

## Overview

Create an edge function that automatically reverts `actual_fte` to the original `FTE` (hired FTE) value when the expiry date passes. This follows the same pattern as the existing `check-expired-overrides` function for volume overrides.

---

## Current State

| Column | Purpose |
|--------|---------|
| `FTE` | Original hired FTE value (source of truth) |
| `actual_fte` | Temporary override value set by department leaders |
| `actual_fte_expiry` | Date when the override should expire |
| `actual_fte_status` | Reason for the override (LOA, FMLA, etc.) |

---

## Solution

### 1. Create Edge Function: `check-expired-fte`

**New File: `supabase/functions/check-expired-fte/index.ts`**

This function will:
1. Query positions where `actual_fte_expiry < today`
2. Reset `actual_fte` back to the `FTE` value
3. Clear `actual_fte_expiry`, `actual_fte_status`, and shared position fields
4. Return count of reverted positions

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const today = new Date().toISOString().split('T')[0];

    // Find positions with expired Active FTE overrides
    const { data: expiredPositions, error: fetchError } = await supabaseClient
      .from('positions')
      .select('id, FTE, actual_fte, actual_fte_expiry, actual_fte_status')
      .not('actual_fte_expiry', 'is', null)
      .lt('actual_fte_expiry', today);

    if (fetchError) throw fetchError;

    if (!expiredPositions || expiredPositions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired Active FTE overrides found',
          count: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Revert each expired position
    let revertedCount = 0;
    for (const position of expiredPositions) {
      const { error: updateError } = await supabaseClient
        .from('positions')
        .update({
          actual_fte: position.FTE, // Revert to hired FTE
          actual_fte_expiry: null,
          actual_fte_status: null,
          actual_fte_shared_with: null,
          actual_fte_shared_fte: null,
          actual_fte_shared_expiry: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', position.id);

      if (!updateError) revertedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reverted ${revertedCount} expired Active FTE override(s)`,
        count: revertedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

---

### 2. Update Supabase Config

**File: `supabase/config.toml`**

Add configuration for the new function:

```toml
[functions.check-expired-fte]
verify_jwt = false
```

---

### 3. Also Check Shared Position Expiry

The function should also handle `actual_fte_shared_expiry` - when this expires, only the shared portion should be cleared while keeping the main override:

```typescript
// After handling main expiry, also check shared expiry separately
const { data: expiredShared, error: sharedFetchError } = await supabaseClient
  .from('positions')
  .select('id')
  .not('actual_fte_shared_expiry', 'is', null)
  .lt('actual_fte_shared_expiry', today);

if (!sharedFetchError && expiredShared?.length > 0) {
  await supabaseClient
    .from('positions')
    .update({
      actual_fte_shared_with: null,
      actual_fte_shared_fte: null,
      actual_fte_shared_expiry: null,
      updated_at: new Date().toISOString(),
    })
    .in('id', expiredShared.map(p => p.id));
}
```

---

## Triggering the Function

The function can be called:

1. **Via Cron Job**: Set up a scheduled job (e.g., daily at midnight) to call this function
2. **On Page Load**: Call the function when loading the Employees/Contractors tabs
3. **Manually**: Admin can trigger it from a button

### Option: Call on Page Load (Recommended for now)

Add a check in the employees/contractors data hooks:

```typescript
// In useEmployees.ts or similar
useEffect(() => {
  // Call expiry check once when component mounts
  supabase.functions.invoke('check-expired-fte');
}, []);
```

---

## Summary of Changes

| File | Type | Description |
|------|------|-------------|
| `supabase/functions/check-expired-fte/index.ts` | CREATE | Edge function to revert expired Active FTE overrides |
| `supabase/config.toml` | UPDATE | Add function configuration |
| `src/hooks/useEmployees.ts` | UPDATE | Optionally invoke expiry check on load |
| `src/hooks/useContractors.ts` | UPDATE | Optionally invoke expiry check on load |

---

## Expected Behavior

| Scenario | Before | After |
|----------|--------|-------|
| Position with `actual_fte=0.5`, `actual_fte_expiry=2026-01-28` (yesterday) | Shows 0.5 FTE | Auto-reverts to `FTE` value, clears expiry/status |
| Position with only `actual_fte_shared_expiry` expired | Keeps main override, shows shared info | Clears shared fields, keeps main override |
| Position with no expiry date set | No change | No change |
