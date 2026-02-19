import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  plan: 'free' | 'pro';
  workshopName: string;
  fullName: string;
  proLaborePercent: number;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string; workshop_name?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid 406 errors
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.error("fetchProfile error:", e);
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Initializing...");
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("AuthProvider: Safety timeout reached!");
        setLoading(false);
      }
    }, 8000);

    // Initial session check
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("invalid refresh token")) {
            await supabase.auth.signOut();
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (e) {
        console.error("initSession error:", e);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("AuthProvider: Auth event:", event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; workshop_name?: string }) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: window.location.origin,
        data: {
          full_name: metadata?.full_name,
          workshop_name: metadata?.workshop_name,
        }
      },
    });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      window.location.href = '/';
    } catch (e) {
      console.error("SignOut error:", e);
      window.location.href = '/';
    }
  };

  const value = {
    session,
    user,
    profile,
    plan: (profile?.plan as 'free' | 'pro') || 'free',
    workshopName: profile?.workshop_name || 'Partilha Pro',
    fullName: profile?.full_name || '',
    proLaborePercent: profile?.pro_labore_percent || 50,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
