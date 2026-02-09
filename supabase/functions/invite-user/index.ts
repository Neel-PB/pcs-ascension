import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, firstName, lastName, roles, bio, accessScope } = await req.json();

    console.log('Inviting user:', { email, firstName, lastName, roles, hasAccessScope: !!accessScope });

    // Use the deployed app URL for redirect
    const appUrl = 'https://pcs-ascension.lovable.app';
    
    // Invite user via admin API - this sends the invitation email
    const { data: userData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        redirectTo: `${appUrl}/auth/setup-password`,
      }
    );

    if (inviteError) {
      console.error('Error inviting user:', inviteError);
      throw inviteError;
    }

    if (!userData.user) {
      throw new Error('User invitation failed - no user returned');
    }

    console.log('User invited successfully, user ID:', userData.user.id);

    // Update profile with bio and email (profile is created by trigger)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        bio: bio || null,
        email: email 
      })
      .eq('id', userData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't throw here, profile might not exist yet until user accepts invitation
    }

    // Assign all selected roles
    const roleInserts = roles.map((role: string) => ({
      user_id: userData.user.id,
      role: role,
    }));

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert(roleInserts);

    if (roleError) {
      console.error('Error assigning roles:', roleError);
      throw roleError;
    }

    console.log('Roles assigned successfully:', roles);

    // Save access scope if provided
    if (accessScope) {
      const accessEntries: Array<{
        user_id: string;
        region: string | null;
        market: string | null;
        facility_id: string | null;
        facility_name: string | null;
        department_id: string | null;
        department_name: string | null;
      }> = [];

      // Add region entries
      (accessScope.regions || []).forEach((region: string) => {
        accessEntries.push({
          user_id: userData.user.id,
          region,
          market: null,
          facility_id: null,
          facility_name: null,
          department_id: null,
          department_name: null,
        });
      });

      // Add market entries
      (accessScope.markets || []).forEach((market: string) => {
        accessEntries.push({
          user_id: userData.user.id,
          region: null,
          market,
          facility_id: null,
          facility_name: null,
          department_id: null,
          department_name: null,
        });
      });

      // Add facility entries
      (accessScope.facilities || []).forEach((item: { facility_id: string; facility_name: string; market?: string }) => {
        accessEntries.push({
          user_id: userData.user.id,
          region: null,
          market: item.market || null,
          facility_id: item.facility_id,
          facility_name: item.facility_name || null,
          department_id: null,
          department_name: null,
        });
      });

      // Add department entries
      (accessScope.departments || []).forEach((item: { department_id: string; department_name: string; facility_id?: string; facility_name?: string; market?: string }) => {
        accessEntries.push({
          user_id: userData.user.id,
          region: null,
          market: item.market || null,
          facility_id: item.facility_id || null,
          facility_name: item.facility_name || null,
          department_id: item.department_id,
          department_name: item.department_name || null,
        });
      });

      if (accessEntries.length > 0) {
        const { error: accessError } = await supabaseAdmin
          .from('user_organization_access')
          .insert(accessEntries);

        if (accessError) {
          console.error('Error saving access scope:', accessError);
          // Don't throw - user is already created, just log the error
        } else {
          console.log('Access scope saved successfully:', accessEntries.length, 'entries');
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: 'Invitation sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in invite-user function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to invite user';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
