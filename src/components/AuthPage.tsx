import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { EmailVerification, ResendVerification, VerificationSuccess } from './EmailVerification';
import FuturisticBackground from './FuturisticBackground';
import { Alert, AlertDescription } from './ui/alert';
import { Info } from 'lucide-react';

type ViewMode = 'login' | 'signup' | 'verify-email' | 'resend-verification' | 'verification-success';

export const AuthPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSignupSuccess = (email: string) => {
    setVerificationEmail(email);
    setViewMode('verify-email');
  };

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
        </div>
      </div>
    </div>
  );
};