import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Profile } from '@/types';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  profile: Profile | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();
        setProfile(userProfile);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          navigate('/'); // Redirigir a la página principal después de iniciar sesión
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        navigate('/login'); // Redirigir a la página de login si no hay sesión
      }
      setIsLoading(false);
    });

    // Fetch initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }: { data: { session: Session | null } }) => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', initialSession.user.id).single();
        setProfile(userProfile);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, isLoading, profile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};