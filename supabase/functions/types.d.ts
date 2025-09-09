// Declare global Deno object
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}

// Declare module for 'https://deno.land/std@0.190.0/http/server.ts'
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): Promise<void>;
}

// Declare module for 'https://esm.sh/@supabase/supabase-js@2.45.0'
declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  import { SupabaseClient, createClient as originalCreateClient } from '@supabase/supabase-js';
  export const createClient: typeof originalCreateClient;
  export { SupabaseClient };
}