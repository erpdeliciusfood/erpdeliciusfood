import { createClient } from '@supabase/supabase-js';

// Lee las variables de entorno de Vite (para desarrollo local)
// y también las variables de entorno directas (para Vercel)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

// Asegúrate de que las variables de entorno estén configuradas
if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL o SUPABASE_URL no está configurada en el entorno.');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY o SUPABASE_ANON_KEY no está configurada en el entorno.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);