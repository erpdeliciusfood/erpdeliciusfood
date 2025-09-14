/// <reference lib="deno.ns" />
// @deno-types="https://deno.land/std@0.190.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @deno-types="npm:@supabase/supabase-js@2.45.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized: Missing Authorization header', {
      status: 401,
      headers: corsHeaders,
    });
  }

  const token = authHeader.replace('Bearer ', '');

  // Create a Supabase client with the user's token to check their role
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response('Unauthorized: Invalid user session', {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Check if the authenticated user is an admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return new Response('Forbidden: Only administrators can update user roles.', {
      status: 403,
      headers: corsHeaders,
    });
  }

  try {
    const { targetUserId, newRole } = await req.json();

    if (!targetUserId || !newRole) {
      return new Response(JSON.stringify({ error: 'Missing targetUserId or newRole' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Update the user's role in auth.users.user_metadata
    const { data: authUser, error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { user_metadata: { role: newRole } }
    );

    if (authUpdateError) {
      console.error('Error updating auth.users user_metadata:', authUpdateError);
      return new Response(JSON.stringify({ error: `Failed to update user metadata: ${authUpdateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Update the user's role in public.profiles
    const { data: profileUpdate, error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)
      .select()
      .single();

    if (profileUpdateError) {
      console.error('Error updating public.profiles role:', profileUpdateError);
      return new Response(JSON.stringify({ error: `Failed to update profile role: ${profileUpdateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: `User ${targetUserId} role updated to ${newRole} successfully.`, profile: profileUpdate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in update-user-role function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});