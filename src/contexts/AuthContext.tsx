import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Test user credentials
const TEST_USER = {
  email: 'gonzalo.ivjn@gmail.com',
  password: 'Toyota2224'
};

// Mock user object for testing
const createMockUser = (email: string): User => ({
  id: 'test-user-id',
  email,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  factors: []
});

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if test user is logged in (stored in localStorage)
    const storedUser = localStorage.getItem('testUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check if it's the test user
    if (email === TEST_USER.email && password === TEST_USER.password) {
      const mockUser = createMockUser(email);
      setUser(mockUser);
      localStorage.setItem('testUser', JSON.stringify(mockUser));
      return { error: null };
    }
    
    // For other users, try Supabase (will fail with current config but won't crash)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Credenciales incorrectas. Use el usuario de prueba: gonzalo.ivjn@gmail.com' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('testUser');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore Supabase errors during signout
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};