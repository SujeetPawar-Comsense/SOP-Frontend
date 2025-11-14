import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { AuthPage } from './AuthPage';
import { Button } from './ui/button';
import { User, LogOut } from 'lucide-react';

interface AppWithAuthProps {
  children: React.ReactNode;
}

export const AppWithAuth: React.FC<AppWithAuthProps> = ({ children }) => {
  const { user, session, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  // Check for recovery token in URL - but only when user is not logged in
  useEffect(() => {
    // If user is logged in, clear recovery token flag and hash, don't check
    if (user && session) {
      setHasRecoveryToken(false);
      sessionStorage.removeItem('password_reset_flow');
      // Clear any hash from URL
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      return;
    }

    const checkForRecoveryToken = () => {
      // First check sessionStorage flag (set by initial HTML script)
      if (sessionStorage.getItem('password_reset_flow') === 'true') {
        return true;
      }
      
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Check hash for access_token and type=recovery
      if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
        sessionStorage.setItem('password_reset_flow', 'true');
        return true;
      }
      
      // Check hash params
      if (hash) {
        try {
          const hashParams = new URLSearchParams(hash.substring(1));
          if (hashParams.get('type') === 'recovery' && hashParams.get('access_token')) {
            sessionStorage.setItem('password_reset_flow', 'true');
            return true;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Check search params
      if (searchParams.get('type') === 'recovery' && searchParams.get('access_token')) {
        sessionStorage.setItem('password_reset_flow', 'true');
        return true;
      }
      
      return false;
    };

    // Check immediately
    if (checkForRecoveryToken()) {
      setHasRecoveryToken(true);
      return;
    }

    // Check after delay (Supabase redirects might set hash after page load)
    const timeoutId = setTimeout(() => {
      if (checkForRecoveryToken()) {
        setHasRecoveryToken(true);
      }
    }, 100);

    // Poll for hash changes (but stop if user logs in)
    const intervalId = setInterval(() => {
      if (user && session) {
        clearInterval(intervalId);
        return;
      }
      if (checkForRecoveryToken()) {
        setHasRecoveryToken(true);
      }
    }, 200);

    // Listen for hash changes
    const handleHashChange = () => {
      if (!user || !session) {
        if (checkForRecoveryToken()) {
          setHasRecoveryToken(true);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show AuthPage only if user is not logged in
  // Recovery token check is handled inside the useEffect above
  if (!user || !session) {
    return <AuthPage />;
  }

  return (
    <>
      {/* User menu in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => setShowUserMenu(!showUserMenu)}
            variant="outline"
            size="sm"
            className="gap-2 bg-black/60 border-green-500/30 hover:bg-green-500/20 text-white backdrop-blur-sm text-left"
          >
            <User className="w-4 h-4" />
            <span className="max-w-[150px] truncate">
              {user.user_metadata?.name || user.email}
            </span>
          </Button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 border border-green-500/30 rounded-lg shadow-xl backdrop-blur-sm">
              <div className="p-4 border-b border-green-500/20">
                <p className="text-sm text-gray-400">Signed in as</p>
                <p className="text-white truncate">{user.email}</p>
                <p className="text-xs text-green-400 mt-1 capitalize">
                  {user.user_metadata?.role?.replace('_', ' ') || 'User'}
                </p>
              </div>
              <div className="p-2">
                <Button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {children}
    </>
  );
};
