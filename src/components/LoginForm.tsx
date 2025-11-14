import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onNeedVerification: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onNeedVerification, onForgotPassword }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      // Handle specific error types
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. If you don\'t have an account yet, please sign up below.');
      } else if (err.message?.includes('verify your email') || 
                 err.message?.includes('Email not confirmed')) {
        setError('Please verify your email address before signing in. Check your inbox for the confirmation email.');
        setNeedsVerification(true);
      } else if (err.message?.includes('Email not found') || err.message?.includes('User not found')) {
        setError('No account found with this email. Please sign up to create an account.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials and try again.');
      }
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/60 border-green-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-green-400">Sign In</CardTitle>
        <CardDescription className="text-gray-400">
          Welcome back! Sign in to access your collaborative platform
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {error.includes('Invalid email or password') && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={onSwitchToSignup}
                      className="text-green-400 hover:text-green-300 underline text-sm"
                    >
                      Create a new account instead →
                    </button>
                  </div>
                )}
                {needsVerification && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={onNeedVerification}
                      className="text-green-400 hover:text-green-300 underline text-sm"
                    >
                      Resend verification email →
                    </button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/40 border-green-500/30 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-green-400 hover:text-green-300 underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/40 border-green-500/30 text-white placeholder:text-gray-500"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-sm text-gray-400 text-center">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-green-400 hover:text-green-300 underline"
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
