// AuthContext provides authentication state and actions using Auth0
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth0, User as Auth0User } from '@auth0/auth0-react';
import userService from '../services/userService';

// Define the shape of our context
interface AuthContextType {
  user: Auth0User | undefined;
  loading: boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | undefined>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider wraps the app and provides Auth0 authentication state/actions
// to other components
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // useAuth0 gives us all Auth0 authentication state and actions
  const { user, isLoading, loginWithRedirect, logout, getAccessTokenSilently } =
    useAuth0();

  // Track if we've already synced to prevent duplicate syncs
  const hasSyncedRef = useRef(false);

  // Helper to get the current access token (JWT)
  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      });
    } catch {
      return undefined;
    }
  };

  // Auto-sync user to database when they log in
  useEffect(() => {
    const syncUserToDatabase = async () => {
      // Only sync if:
      // 1. User is authenticated
      // 2. Auth0 has finished loading
      // 3. We haven't already synced this session
      if (user && !isLoading && !hasSyncedRef.current) {
        try {
          console.log('🔄 Auto-syncing user to database:', user.sub);
          const token = await getAccessToken();
          console.log('🔑 Got access token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
          if (token) {
            await userService.syncUser(token);
            hasSyncedRef.current = true;
            console.log('✅ User synced successfully');
          } else {
            console.error('❌ No access token available');
          }
        } catch (error) {
          console.error('❌ Failed to sync user:', error);
          // Don't block login on sync failure - user can still use the app
        }
      }
    };

    syncUserToDatabase();
  }, [user, isLoading]); // Re-run when user or loading state changes

  // Provide login and logout actions
  // Note: logout() will redirect to the default Auth0 logout page and then back to your app
  const value: AuthContextType = {
    user,
    loading: isLoading,
    login: () => {
      const returnTo = window.location.pathname;
      console.log('🔐 Login initiated from:', returnTo);
      // Save to sessionStorage as backup
      sessionStorage.setItem('auth_return_to', returnTo);
      loginWithRedirect({
        appState: { returnTo }
      });
    },
    logout: () => logout(),
    getAccessToken,
  };

  // Wrap children with AuthContext.Provider
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
