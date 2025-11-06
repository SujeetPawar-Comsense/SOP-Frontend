import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import FuturisticBackground from './FuturisticBackground';
import { Alert, AlertDescription } from './ui/alert';
import { Info } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

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

          {!isLogin && (
            <Alert className="mb-4 bg-blue-900/20 border-blue-500/50">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                First time here? Create your account to get started!
              </AlertDescription>
            </Alert>
          )}

          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};