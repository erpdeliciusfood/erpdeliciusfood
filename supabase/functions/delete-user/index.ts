import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => { // Corregido: Añadido tipo 'Request' a 'req'
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key to perform admin actions
    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Get the authorization header from the incoming request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const token = authHeader.replace('Bearer ', '')

    // 2. Get the user making the request from the token
    const { data: { user } } = await serviceRoleClient.auth.getUser(token)
    if (!user) {
      throw new Error('Invalid token')
    }

    // 3. Check if the user has the 'admin' role
    const { data: profile, error: profileError } = await serviceRoleClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Permission denied: User is not an admin.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Get the user_id to delete from the request body
    const { userIdToDelete } = await req.json()
    if (!userIdToDelete) {
      throw new Error('Missing userIdToDelete in request body')
    }
    
    // 5. Prevent an admin from deleting themselves
    if (user.id === userIdToDelete) {
      return new Response(JSON.stringify({ error: 'Admins cannot delete themselves.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 6. Delete the user using the admin client
    const { error: deleteError } = await serviceRoleClient.auth.admin.deleteUser(userIdToDelete)

    if (deleteError) {
      throw deleteError
    }

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) { // Corregido: Añadido tipo 'unknown'
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) { // Corregido: Comprobación de tipo para 'error'
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})