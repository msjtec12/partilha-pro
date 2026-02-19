import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    console.log("useAuth: Initing auth listeners...");
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("useAuth: Safety timeout reached, forcing loading false");
        setLoading(false);
      }
    }, 6000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("useAuth: Auth state change event:", _event);
      try {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Auth change error:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    });

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session init error object:", error);
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("invalid refresh token")) {
            console.warn("Invalid refresh token detected, clearing session...");
            await supabase.auth.signOut();
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (e) {
        console.error("Session init exception:", e);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    initSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; workshop_name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: window.location.origin,
        data: {
          full_name: metadata?.full_name,
          workshop_name: metadata?.workshop_name,
          plan: 'free'
        }
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { 
    session, 
    user, 
    profile, 
    plan: profile?.plan || 'free', 
    workshopName: profile?.workshop_name || 'Partilha Pro',
    fullName: profile?.full_name || '',
    proLaborePercent: profile?.pro_labore_percent || 50,
    loading, 
    signUp, 
    signIn, 
    signOut 
  };
}
