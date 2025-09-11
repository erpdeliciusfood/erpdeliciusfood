import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        if (event === 'SIGNED_IN' && location.pathname === '/login') {
          navigate('/');
        } else if (event === 'USER_UPDATED') {
          // No automatic redirect on USER_UPDATED, let the app handle it if needed
        }
      } else {
        setSession(null);
        setUser(null);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }: { data: { session: Session | null } }) => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
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