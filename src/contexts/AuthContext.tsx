import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut: (queryClient?: QueryClient) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Don't update state if we're actively signing out
        if (isSigningOutRef.current) {
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isSigningOutRef.current) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Account created successfully!");
    return { data };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Signed in successfully!");
    return { data };
  }, []);

  const signOut = useCallback(async (queryClient?: QueryClient) => {
    // Set flag to prevent auth state updates during logout
    isSigningOutRef.current = true;
    
    // Clear all queries first to prevent refetches
    if (queryClient) {
      queryClient.clear();
    }
    
    // Manually clear auth state immediately
    setSession(null);
    setUser(null);
    
    // Forcefully clear local session
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    
    // Don't show error toast for expected session-related errors during logout
    if (error && !error.message?.includes('session')) {
      toast.error(error.message);
      isSigningOutRef.current = false;
      return { error };
    }

    toast.success("Signed out successfully!");
    
    // Reset flag after a brief delay to allow state to settle
    setTimeout(() => {
      isSigningOutRef.current = false;
    }, 200);
    
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
