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
    console.log(`Checking for expired Active FTE overrides as of ${today}`);

    // Find positions with expired Active FTE overrides
    const { data: expiredPositions, error: fetchError } = await supabaseClient
      .from('positions')
      .select('id, FTE, actual_fte, actual_fte_expiry, actual_fte_status')
      .not('actual_fte_expiry', 'is', null)
      .lt('actual_fte_expiry', today);

    if (fetchError) {
      console.error('Error fetching expired positions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredPositions?.length || 0} positions with expired Active FTE overrides`);

    if (!expiredPositions || expiredPositions.length === 0) {
      // Also check for expired shared position expiry separately
      const sharedResult = await handleExpiredSharedPositions(supabaseClient, today);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired Active FTE overrides found',
          count: 0,
          sharedExpiredCount: sharedResult.count,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Revert each expired position
    let revertedCount = 0;
    for (const position of expiredPositions) {
      console.log(`Reverting position ${position.id}: actual_fte ${position.actual_fte} -> FTE ${position.FTE}`);
      
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

      if (updateError) {
        console.error(`Error updating position ${position.id}:`, updateError);
      } else {
        revertedCount++;
      }
    }

    // Also check for expired shared position expiry separately
    const sharedResult = await handleExpiredSharedPositions(supabaseClient, today);

    console.log(`Successfully reverted ${revertedCount} expired Active FTE override(s)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reverted ${revertedCount} expired Active FTE override(s)`,
        count: revertedCount,
        sharedExpiredCount: sharedResult.count,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in check-expired-fte:', errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handle positions where only the shared position expiry has passed
// (main override is still valid, just clear the shared fields)
async function handleExpiredSharedPositions(
  supabaseClient: any,
  today: string
): Promise<{ count: number }> {
  try {
    // Find positions where shared expiry is past but main expiry is still valid (or null)
    const { data: expiredShared, error: sharedFetchError } = await supabaseClient
      .from('positions')
      .select('id')
      .not('actual_fte_shared_expiry', 'is', null)
      .lt('actual_fte_shared_expiry', today)
      .or('actual_fte_expiry.is.null,actual_fte_expiry.gte.' + today);

    if (sharedFetchError) {
      console.error('Error fetching expired shared positions:', sharedFetchError);
      return { count: 0 };
    }

    if (!expiredShared || expiredShared.length === 0) {
      return { count: 0 };
    }

    console.log(`Found ${expiredShared.length} positions with expired shared position expiry`);

    const { error: updateError } = await supabaseClient
      .from('positions')
      .update({
        actual_fte_shared_with: null,
        actual_fte_shared_fte: null,
        actual_fte_shared_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .in('id', expiredShared.map((p: { id: string }) => p.id));

    if (updateError) {
      console.error('Error clearing expired shared fields:', updateError);
      return { count: 0 };
    }

    console.log(`Cleared shared fields for ${expiredShared.length} position(s)`);
    return { count: expiredShared.length };
  } catch (error) {
    console.error('Error in handleExpiredSharedPositions:', error);
    return { count: 0 };
  }
}
