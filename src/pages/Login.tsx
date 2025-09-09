import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Iniciar Sesión</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Puedes añadir 'google', 'github', etc. aquí si los configuras en Supabase
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light" // O "dark" si prefieres
          redirectTo={window.location.origin} // Redirige a la raíz después del login
        />
      </div>
    </div>
  );
};

export default Login;