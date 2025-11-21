import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { KeyRound, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success('Password reset email sent!');
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
                Check Your Email
              </h2>
              <p className="text-gray-400 text-sm">
                We've sent a password reset link to
              </p>
              <p className="text-green-500 font-medium mt-1">
                {email}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white mb-1">Next steps</p>
                <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the password reset link</li>
                  <li>Enter your new password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>
            </div>

            <div className="text-center text-xs text-gray-400">
              <p>Didn't receive the email? Check your spam folder or try again.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant="outline"
              className="w-full border-green-500/30 text-green-500 hover:bg-green-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Email'
              )}
            </Button>

            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </div>
      </Card>
    );
  }

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
            Forgot Password?
          </h2>
          <p className="text-gray-400 text-sm">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-500"
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 mr-2" />
                Send Email
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    </Card>
  );
};

