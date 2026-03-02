import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loginWithMicrosoft } from "@/lib/msalAuth";
import { toast } from "sonner";

interface MsalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  msalUser: MsalUser | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signInWithMicrosoft: () => Promise<{ data?: any; error?: any }>;
  signOut: (queryClient?: QueryClient) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [msalUser, setMsalUser] = useState<MsalUser | null>(() => {
    const stored = sessionStorage.getItem("msal_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isSigningOutRef.current) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isSigningOutRef.current) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      // Also check for stored MSAL session
      if (!session && !msalUser) {
        setLoading(false);
      } else {
        setLoading(false);
      }
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
        data: { first_name: firstName, last_name: lastName },
      },
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Account created successfully!");
    return { data };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Signed in successfully!");
    return { data };
  }, []);

  const signInWithMicrosoft = useCallback(async () => {
    try {
      const msalResult = await loginWithMicrosoft();

      // Send the ID token to your NestJS API for verification
      const response = await fetch(`${API_BASE_URL}/auth/msal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: msalResult.idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Authentication failed");
      }

      const data = await response.json();

      // Store the MSAL user info and token
      const msalUserData: MsalUser = {
        id: data.user?.id || "",
        email: data.user?.email || msalResult.email,
        firstName: data.user?.firstName || msalResult.firstName,
        lastName: data.user?.lastName || msalResult.lastName,
      };

      setMsalUser(msalUserData);
      sessionStorage.setItem("msal_user", JSON.stringify(msalUserData));

      if (data.access_token) {
        sessionStorage.setItem("msal_access_token", data.access_token);
      }

      toast.success("Signed in with Microsoft successfully!");
      return { data };
    } catch (error: any) {
      const message = error.message || "Microsoft sign-in failed";
      if (!message.includes("Redirecting")) {
        toast.error(message);
      }
      return { error };
    }
  }, []);

  const signOut = useCallback(async (queryClient?: QueryClient) => {
    isSigningOutRef.current = true;

    if (queryClient) queryClient.clear();

    setSession(null);
    setUser(null);
    setMsalUser(null);
    sessionStorage.removeItem("msal_user");
    sessionStorage.removeItem("msal_access_token");

    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error && !error.message?.includes("session")) {
      toast.error(error.message);
      isSigningOutRef.current = false;
      return { error };
    }

    toast.success("Signed out successfully!");
    setTimeout(() => { isSigningOutRef.current = false; }, 200);
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, msalUser, loading, signUp, signIn, signInWithMicrosoft, signOut }}>
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
