import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { KeyRound, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import supabase from '../utils/supabaseClient';

interface ResetPasswordProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onSuccess, onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasValidSession, setHasValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Check if this is a recovery flow by checking the URL hash
    const hash = window.location.hash;
    const isRecoveryFlow = hash.includes('type=recovery') || hash.includes('access_token');
    
    if (!isRecoveryFlow) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    console.log('🔐 ResetPassword - Recovery flow detected');
    console.log('🔐 ResetPassword - URL hash:', hash);

    // Set up auth state listener to catch when Supabase processes the recovery token
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session ? 'Session present' : 'No session');
      
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        console.log('✅ Recovery session established');
        setHasValidSession(true);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token refreshed, check if it's still a recovery session
        const currentHash = window.location.hash;
        if (currentHash.includes('type=recovery')) {
          console.log('✅ Recovery session refreshed');
          setHasValidSession(true);
        }
      }
    });

    // Also check immediately for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          // Don't set error yet, wait for auth state change
          return;
        }

        if (session) {
          console.log('✅ Existing recovery session found');
          setHasValidSession(true);
        } else {
          // No session yet, but hash is present - Supabase should process it
          console.log('⏳ Waiting for Supabase to process recovery token...');
          
          // Give Supabase a moment to process the hash
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              console.log('✅ Session created after delay');
              setHasValidSession(true);
            } else {
              console.error('❌ No session found after delay');
              setError('Invalid or expired reset token. Please request a new password reset link.');
            }
          }, 1000);
        }
      } catch (err) {
        console.error('❌ Error checking session:', err);
        setError('Failed to verify reset token. Please try again.');
      }
    };

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!hasValidSession) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }

    setLoading(true);
    try {
      // Get the current session to ensure we have a valid recovery session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No valid session found. The reset token may have expired.');
      }

      // Use Supabase's updateUser method to reset the password
      // This works with the recovery session automatically
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        
        // Handle specific Supabase errors
        if (updateError.message.includes('expired') || updateError.message.includes('invalid')) {
          throw new Error('The reset token has expired. Please request a new password reset link.');
        }
        throw new Error(updateError.message || 'Failed to update password');
      }

      // Success!
      setResetSuccess(true);
      toast.success('Password reset successfully!');
      
      // Clear the hash from URL to remove the recovery token
      window.history.replaceState(null, '', window.location.pathname);
      
      // Clear sessionStorage flag
      sessionStorage.removeItem('password_reset_flow');
      
      // Sign out to clear the recovery session
      // User will need to sign in with the new password
      await supabase.auth.signOut();
      
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto bg-black/60 border-green-500/30 backdrop-blur-sm">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Password Reset Successfully!
              </h2>
              <p className="text-gray-400">
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
          </div>

          <Button
            onClick={onSuccess}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
          >
            Sign In Now
          </Button>
        </div>
      </Card>
    );
  }

  console.log('🎨 Rendering ResetPassword form');

  return (
    <Card className="w-full max-w-md mx-auto bg-black/60 border-green-500/30 backdrop-blur-sm">
      <div className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-500/20 p-4">
              <KeyRound className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Reset Your Password
          </h2>
          <p className="text-gray-400 text-sm">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {error.includes('Invalid reset token') && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="text-green-400 hover:text-green-300 underline text-sm"
                    >
                      Go back and request a new link →
                    </button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-500 pr-10"
                disabled={loading || !hasValidSession}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-500 pr-10"
                disabled={loading || !hasValidSession}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !hasValidSession}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 mr-2" />
                Reset Password
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={onBackToLogin}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};

