"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const refreshSession = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setState((s) => ({ ...s, user: null, session: null, loading: false }));
      return;
    }
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (!error) {
      setState((s) => ({
        ...s,
        session: session ?? null,
        user: session?.user ?? null,
        loading: false,
      }));
    } else {
      setState((s) => ({ ...s, user: null, session: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setState((s) => ({ ...s, user: null, session: null, loading: false }));
      return;
    }
    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({
        ...s,
        session: session ?? null,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return { error: new Error("Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e a chave anon.") };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      return { error: new Error("Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e a chave anon.") };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setState((s) => ({ ...s, user: null, session: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return ctx;
}
