import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, MockUser, MockSession } from '../utils/api';

interface AuthContextType {
  user: MockUser | null;
  session: MockSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'project_owner' | 'vibe_engineer') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check if this is a password reset flow (recovery token in URL)
      // Check multiple times with delay to catch Supabase redirects
      const checkForRecoveryToken = () => {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check hash for access_token and type=recovery
        if (hash.includes('access_token') && hash.includes('type=recovery')) {
          return true;
        }
        
        // Check search params (in case Supabase uses query params)
        if (searchParams.get('type') === 'recovery' && searchParams.get('access_token')) {
          return true;
        }
        
        // Check for recovery in hash params
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          if (hashParams.get('type') === 'recovery' && hashParams.get('access_token')) {
            return true;
          }
        }
        
        return false;
      };

      // Check immediately
      if (checkForRecoveryToken()) {
        console.log('🔑 Recovery token detected in AuthProvider - allowing recovery session');
        // This is a password reset flow
        // Don't clear the session - Supabase needs it to process the recovery token
        // Just set loading to false so AuthPage can show the reset form
        setLoading(false);
        // Don't set session/user - let ResetPassword component handle the recovery session
        return;
      }

      const currentSession = await authAPI.getSession();
      
      if (currentSession) {
        const currentUser = await authAPI.getCurrentUser();
        
        // If user is null but session exists, clear it
        if (!currentUser) {
          await authAPI.signOut();
          setSession(null);
          setUser(null);
        } else {
          // Valid session and user
          setSession(currentSession);
          setUser(currentUser);
        }
      } else {
        // No session found
        setSession(null);
        setUser(null);
      }
    } catch (error: any) {
      // Unexpected errors - clear session silently
      await authAPI.signOut().catch(() => {});
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in...');
      const { session: newSession, user: newUser } = await authAPI.signIn(email, password);
      console.log('✅ Sign in successful - Session:', newSession ? 'Present' : 'Missing', 'User:', newUser ? 'Present' : 'Missing');
      setSession(newSession);
      setUser(newUser);
      console.log('✅ Auth state updated - should redirect to app now');
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'project_owner' | 'vibe_engineer'
  ) => {
    try {
      await authAPI.signUp(email, password, name, role);
      // Don't automatically sign in - user needs to verify email first
      // Return success without signing in
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};