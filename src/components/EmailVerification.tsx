import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  email, 
  onBackToLogin 
}) => {
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(result.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/60 border-green-500/30 backdrop-blur-sm">
      <div className="p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/20 p-4">
              <Mail className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-400 text-sm">
              We've sent a verification link to
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
              <p className="font-medium text-white mb-1">Check your email</p>
              <p className="text-gray-400">
                Click the verification link in the email to activate your account.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-gray-400">
              Didn't receive the email?
            </p>
            <Button
              onClick={handleResendVerification}
              disabled={resending}
              variant="outline"
              className="w-full border-green-500/30 text-green-500 hover:bg-green-500/10"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={onBackToLogin}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Component to show when verification is successful
interface VerificationSuccessProps {
  onSignIn: () => void;
}

export const VerificationSuccess: React.FC<VerificationSuccessProps> = ({ 
  onSignIn 
}) => {
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
              Email Verified!
            </h2>
            <p className="text-gray-400">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
          </div>
        </div>

        <Button
          onClick={onSignIn}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
        >
          Sign In Now
        </Button>
      </div>
    </Card>
  );
};

// Component for resending verification (standalone)
interface ResendVerificationProps {
  onBackToLogin: () => void;
}

export const ResendVerification: React.FC<ResendVerificationProps> = ({ 
  onBackToLogin 
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Verification email sent!');
        setEmail('');
      } else {
        toast.error(result.message || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/60 border-green-500/30 backdrop-blur-sm">
      <div className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-500/20 p-4">
              <Mail className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Resend Verification
          </h2>
          <p className="text-gray-400 text-sm">
            Enter your email to receive a new verification link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="bg-black/50 border-green-500/30 text-white"
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
              'Send Verification Email'
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={onBackToLogin}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </Card>
  );
};

