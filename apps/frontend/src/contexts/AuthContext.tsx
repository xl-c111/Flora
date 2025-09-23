import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData?: Record<string, unknown>
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // cleanup function when the components unmount => stop listenning for changes
    return () => subscription.unsubscribe();
  }, []); // empty dependency =  run the effect once

  const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
    console.log('📝 Attempting sign up with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      console.error('❌ Sign up error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('✅ Sign up response:', data);
      if (data.user && !data.session) {
        console.log('📧 User created but needs email confirmation');
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign in error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('✅ Sign in successful:', data);
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  // finally bundle it into a TOOLBOX
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  // so any components later can access and use it
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
