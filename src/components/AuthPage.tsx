import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { EmailVerification, ResendVerification, VerificationSuccess } from './EmailVerification';
import { ForgotPassword } from './ForgotPassword';
import { ResetPassword } from './ResetPassword';
import FuturisticBackground from './FuturisticBackground';
import { Alert, AlertDescription } from './ui/alert';
import { Info } from 'lucide-react';

type ViewMode = 'login' | 'signup' | 'verify-email' | 'resend-verification' | 'verification-success' | 'forgot-password' | 'reset-password';

export const AuthPage: React.FC = () => {
  // Check if this is a password reset flow
  const checkForResetToken = (): boolean => {
    // First check sessionStorage flag set by initial script
    if (sessionStorage.getItem('password_reset_flow') === 'true') {
      console.log('✅ Found recovery token flag in sessionStorage');
      return true;
    }
    
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    
    console.log('🔍 Checking for reset token - Hash:', hash, 'Search:', window.location.search);
    
    // Check hash for access_token and type=recovery
    if (hash) {
      if (hash.includes('access_token') && hash.includes('type=recovery')) {
        console.log('✅ Found recovery token in hash');
        sessionStorage.setItem('password_reset_flow', 'true');
        return true;
      }
      
      // Parse hash params more carefully
      try {
        const hashParams = new URLSearchParams(hash.substring(1));
        const token = hashParams.get('access_token');
        const type = hashParams.get('type');
        if (token && type === 'recovery') {
          console.log('✅ Found recovery token in hash params');
          sessionStorage.setItem('password_reset_flow', 'true');
          return true;
        }
      } catch (e) {
        console.error('Error parsing hash:', e);
      }
    }
    
    // Also check URL search params (in case Supabase uses query params)
    const searchType = searchParams.get('type');
    const searchToken = searchParams.get('access_token');
    if (searchType === 'recovery' && searchToken) {
      console.log('✅ Found recovery token in search params');
      sessionStorage.setItem('password_reset_flow', 'true');
      return true;
    }
    
    // Check if pathname is /reset-password (fallback)
    if (window.location.pathname === '/reset-password') {
      console.log('✅ Found /reset-password pathname');
      return true;
    }
    
    return false;
  };

  // Initialize with reset-password if recovery token is present
  const getInitialViewMode = (): ViewMode => {
    if (checkForResetToken()) {
      console.log('🔑 Recovery token detected, showing reset password form');
      return 'reset-password';
    }
    return 'login';
  };

  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Monitor URL hash and pathname changes
  useEffect(() => {
    const checkForReset = () => {
      if (checkForResetToken()) {
        console.log('🔑 Recovery token detected in URL change - switching to reset-password');
        setViewMode('reset-password');
      } else if (viewMode === 'reset-password' && !checkForResetToken()) {
        // If we were on reset-password but token is gone, go back to login
        console.log('⚠️ Reset token no longer present - switching to login');
        setViewMode('login');
      }
    };

    // Check immediately on mount
    checkForReset();
    
    // Also check after a short delay (Supabase redirects might set hash after page load)
    const timeoutId = setTimeout(() => {
      checkForReset();
    }, 100);
    
    // Check on hash/pathname changes
    window.addEventListener('hashchange', checkForReset);
    window.addEventListener('popstate', checkForReset);
    
    // Also poll for hash changes (in case Supabase sets it asynchronously)
    const intervalId = setInterval(() => {
      if (viewMode !== 'reset-password' && checkForResetToken()) {
        console.log('🔑 Recovery token detected via polling - switching to reset-password');
        setViewMode('reset-password');
      }
    }, 200);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('hashchange', checkForReset);
      window.removeEventListener('popstate', checkForReset);
    };
  }, [viewMode]);

  const handleSignupSuccess = (email: string) => {
    setVerificationEmail(email);
    setViewMode('verify-email');
  };

  // Debug: Log current view mode
  console.log('📱 Current viewMode:', viewMode);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FuturisticBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Collaborative AI Platform
            </h1>
            <p className="text-gray-400 text-lg">
              Build applications 3x faster with AI-powered prompts
            </p>
          </div>

          {viewMode === 'signup' && (
            <Alert className="mb-4 bg-blue-900/20 border-blue-500/50">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                First time here? Create your account to get started!
              </AlertDescription>
            </Alert>
          )}

          {viewMode === 'login' && (
            <LoginForm 
              onSwitchToSignup={() => setViewMode('signup')}
              onNeedVerification={() => setViewMode('resend-verification')}
              onForgotPassword={() => setViewMode('forgot-password')}
            />
          )}
          
          {viewMode === 'signup' && (
            <SignupForm 
              onSwitchToLogin={() => setViewMode('login')}
              onSignupSuccess={handleSignupSuccess}
            />
          )}
          
          {viewMode === 'verify-email' && (
            <EmailVerification 
              email={verificationEmail}
              onBackToLogin={() => setViewMode('login')}
            />
          )}
          
          {viewMode === 'resend-verification' && (
            <ResendVerification 
              onBackToLogin={() => setViewMode('login')}
            />
          )}
          
          {viewMode === 'verification-success' && (
            <VerificationSuccess 
              onSignIn={() => setViewMode('login')}
            />
          )}
          
          {viewMode === 'forgot-password' && (
            <ForgotPassword 
              onBackToLogin={() => setViewMode('login')}
            />
          )}
          
          {viewMode === 'reset-password' && (
            <ResetPassword 
              onSuccess={() => setViewMode('login')}
              onBackToLogin={() => setViewMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};