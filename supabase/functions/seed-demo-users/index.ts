import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEMO_USERS = [
  { email: "demo.admin@ascension.org", role: "admin", firstName: "Demo", lastName: "Admin" },
  { email: "demo.labor@ascension.org", role: "labor_team", firstName: "Demo", lastName: "Labor" },
  { email: "demo.leadership@ascension.org", role: "leadership", firstName: "Demo", lastName: "Leadership" },
  { email: "demo.director@ascension.org", role: "director", firstName: "Demo", lastName: "Director" },
  { email: "demo.manager@ascension.org", role: "manager", firstName: "Demo", lastName: "Manager" },
];

const DEFAULT_PASSWORD = "demo123";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const demoUser of DEMO_USERS) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === demoUser.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        results.push({ email: demoUser.email, status: "exists", userId });
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: demoUser.email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            first_name: demoUser.firstName,
            last_name: demoUser.lastName,
          },
        });

        if (createError) {
          results.push({ email: demoUser.email, status: "error", error: createError.message });
          continue;
        }

        userId = newUser.user.id;
        results.push({ email: demoUser.email, status: "created", userId });
      }

      // Ensure role is assigned (upsert to handle existing)
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: userId, role: demoUser.role },
          { onConflict: "user_id,role" }
        );

      if (roleError) {
        results.push({ email: demoUser.email, roleStatus: "error", roleError: roleError.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
