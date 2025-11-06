import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, MockUser, MockSession } from '../utils/mockApi';

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
      const { session: newSession, user: newUser } = await authAPI.signIn(email, password);
      setSession(newSession);
      setUser(newUser);
    } catch (error) {
      console.error('Sign in error:', error);
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
      // After signup, sign in automatically
      await signIn(email, password);
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