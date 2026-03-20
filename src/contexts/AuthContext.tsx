import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loginWithMicrosoft } from "@/lib/msalAuth";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  mustChangePassword: boolean;
  checkEmail: (email: string) => Promise<{ exists: boolean; registered: boolean }>;
  setInitialPassword: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signInWithMicrosoft: () => Promise<{ data?: any; error?: any }>;
  signOut: (queryClient?: QueryClient) => Promise<{ error: any | null }>;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const isSigningOutRef = useRef(false);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const storedUser = sessionStorage.getItem("nestjs_user");
      const storedToken = sessionStorage.getItem("nestjs_token");

      if (storedUser && storedToken) {
        try {
          const data = await apiFetch("/auth/me");
          const appUser: AppUser = {
            id: data.id,
            email: data.email,
            firstName: data.firstName || data.first_name || "",
            lastName: data.lastName || data.last_name || "",
            role: data.role || "user",
          };
          setUser(appUser);
          sessionStorage.setItem("nestjs_user", JSON.stringify(appUser));

          const mustChange = sessionStorage.getItem("nestjs_must_change_password") === "true";
          setMustChangePassword(mustChange);
        } catch {
          // Token invalid — clear
          sessionStorage.removeItem("nestjs_token");
          sessionStorage.removeItem("nestjs_user");
          sessionStorage.removeItem("nestjs_must_change_password");
        }
      }

      // Also let Supabase restore its own session (for RLS data queries)
      // No action needed — supabase client auto-restores from localStorage
      setLoading(false);
    };

    restore();
  }, []);

  // Keep Supabase onAuthStateChange for RLS session awareness
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // We don't set user from Supabase — NestJS is authority
      // This just keeps Supabase session alive for data queries
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const appUser: AppUser = {
        id: data.user?.id || "",
        email: data.user?.email || email,
        firstName: data.user?.firstName || data.user?.first_name || "",
        lastName: data.user?.lastName || data.user?.last_name || "",
        role: data.user?.role || "user",
      };

      sessionStorage.setItem("nestjs_token", data.access_token);
      sessionStorage.setItem("nestjs_user", JSON.stringify(appUser));

      if (data.must_change_password) {
        sessionStorage.setItem("nestjs_must_change_password", "true");
        setMustChangePassword(true);
      } else {
        sessionStorage.removeItem("nestjs_must_change_password");
        setMustChangePassword(false);
      }

      setUser(appUser);

      // Silent Supabase session for RLS-protected data queries
      try {
        await supabase.auth.signInWithPassword({ email, password });
      } catch {
        // Non-critical — data queries may fail but auth works
        console.warn("Silent Supabase session failed — RLS queries may be affected");
      }

      toast.success("Signed in successfully!");
      return { data };
    } catch (err: any) {
      toast.error(err.message || "Sign-in failed");
      return { error: err };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const appUser: AppUser = {
        id: data.user?.id || "",
        email: data.user?.email || email,
        firstName: data.user?.firstName || firstName,
        lastName: data.user?.lastName || lastName,
        role: data.user?.role || "user",
      };

      sessionStorage.setItem("nestjs_token", data.access_token);
      sessionStorage.setItem("nestjs_user", JSON.stringify(appUser));
      setUser(appUser);

      // Silent Supabase session
      try {
        await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName } },
        });
      } catch {
        console.warn("Silent Supabase signup failed");
      }

      toast.success("Account created successfully!");
      return { data };
    } catch (err: any) {
      toast.error(err.message || "Sign-up failed");
      return { error: err };
    }
  }, []);

  const signInWithMicrosoft = useCallback(async () => {
    try {
      const msalResult = await loginWithMicrosoft();

      const data = await apiFetch<any>("/auth/msal", {
        method: "POST",
        body: JSON.stringify({ idToken: msalResult.idToken }),
      });

      const appUser: AppUser = {
        id: data.user?.id || "",
        email: data.user?.email || msalResult.email,
        firstName: data.user?.firstName || msalResult.firstName,
        lastName: data.user?.lastName || msalResult.lastName,
        role: data.user?.role || "user",
      };

      if (data.access_token) {
        sessionStorage.setItem("nestjs_token", data.access_token);
        sessionStorage.setItem("msal_access_token", data.access_token);
      }
      sessionStorage.setItem("nestjs_user", JSON.stringify(appUser));
      sessionStorage.setItem("msal_user", JSON.stringify(appUser));
      setUser(appUser);

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

    setUser(null);
    setMustChangePassword(false);

    sessionStorage.removeItem("nestjs_token");
    sessionStorage.removeItem("nestjs_user");
    sessionStorage.removeItem("nestjs_must_change_password");
    sessionStorage.removeItem("msal_user");
    sessionStorage.removeItem("msal_access_token");

    // Clear Supabase session too
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});

    toast.success("Signed out successfully!");
    setTimeout(() => { isSigningOutRef.current = false; }, 200);
    return { error: null };
  }, []);

  const clearMustChangePassword = useCallback(() => {
    setMustChangePassword(false);
    sessionStorage.removeItem("nestjs_must_change_password");
  }, []);

  const checkEmail = useCallback(async (email: string): Promise<{ exists: boolean; registered: boolean }> => {
    try {
      const data = await apiFetch(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return { exists: !!data.exists, registered: !!data.registered };
    } catch {
      return { exists: false, registered: false };
    }
  }, []);

  const setInitialPassword = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiFetch("/auth/set-initial-password", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const appUser: AppUser = {
        id: data.user?.id || "",
        email: data.user?.email || email,
        firstName: data.user?.firstName || data.user?.first_name || "",
        lastName: data.user?.lastName || data.user?.last_name || "",
        role: data.user?.role || "user",
      };

      sessionStorage.setItem("nestjs_token", data.access_token);
      sessionStorage.setItem("nestjs_user", JSON.stringify(appUser));
      sessionStorage.removeItem("nestjs_must_change_password");
      setMustChangePassword(false);
      setUser(appUser);

      // Silent Supabase session for RLS
      try {
        await supabase.auth.signInWithPassword({ email, password });
      } catch {
        console.warn("Silent Supabase session failed");
      }

      toast.success("Password set successfully!");
      return { data };
    } catch (err: any) {
      toast.error(err.message || "Failed to set password");
      return { error: err };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, mustChangePassword, checkEmail, setInitialPassword, signUp, signIn, signInWithMicrosoft, signOut, clearMustChangePassword }}>
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
