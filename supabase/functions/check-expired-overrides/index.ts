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

    // Find expired overrides
    const today = new Date().toISOString().split('T')[0];
    
    const { data: expiredOverrides, error: fetchError } = await supabaseClient
      .from('volume_overrides')
      .select('*')
      .lt('expiry_date', today);

    if (fetchError) {
      throw fetchError;
    }

    // Update expired overrides with validation status
    if (expiredOverrides && expiredOverrides.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('volume_overrides')
        .update({
          validation_status: 'expired',
          validation_message: 'Override expired - system will use target volume',
        })
        .lt('expiry_date', today)
        .neq('validation_status', 'expired');

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Updated ${expiredOverrides.length} expired override(s)`,
          count: expiredOverrides.length,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No expired overrides found',
        count: 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
