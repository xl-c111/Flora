// AuthContext provides authentication state and actions using Auth0
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth0, User as Auth0User } from '@auth0/auth0-react';
import userService from '../services/userService';
import type { UserProfile } from '../services/userService';

// Define the shape of our context
interface AuthContextType {
  user: Auth0User | undefined;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (returnToPath?: string | React.MouseEvent | React.KeyboardEvent) => void;
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

// Check if authentication is disabled (for demo deployments)
const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true';

// Mock user for demo mode (when Auth0 is disabled)
const demoUser: Auth0User = {
  sub: 'demo-user-001',
  name: 'Demo User',
  email: 'demo@flora.com',
  picture: 'https://via.placeholder.com/150',
};

// AuthProvider wraps the app and provides Auth0 authentication state/actions
// to other components
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo mode: Skip Auth0 entirely
  if (isAuthDisabled) {
    const value: AuthContextType = {
      user: demoUser,
      userProfile: {
        id: 'demo-user-001',
        email: 'demo@flora.com',
        firstName: 'Demo',
        lastName: 'User',
        phone: null,
        role: 'USER',
        favoriteOccasions: [],
        favoriteColors: [],
        favoriteMoods: [],
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loading: false,
      login: () => console.log('Demo mode: login skipped'),
      logout: () => console.log('Demo mode: logout skipped'),
      getAccessToken: async () => 'demo-token',
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  // Production mode: Use Auth0
  // useAuth0 gives us all Auth0 authentication state and actions
  const {
    user,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Track if we've already synced to prevent duplicate syncs
  const hasSyncedRef = useRef(false);
  const redirectInProgressRef = useRef(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Helper to get the current access token (JWT)
  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email offline_access',
        },
      });
    } catch (error: any) {
      // If silent auth fails (e.g. first visit on a new origin, missing consent, expired session),
      // fall back to a redirect-based login. Avoid popup-based flows which are often blocked.
      const errorCode = error?.error ?? error?.code;
      const shouldRedirect =
        errorCode === 'login_required' ||
        errorCode === 'consent_required' ||
        errorCode === 'interaction_required';

      if (shouldRedirect && !redirectInProgressRef.current) {
        redirectInProgressRef.current = true;

        const returnTo = window.location.pathname || '/';
        sessionStorage.setItem('auth_return_to', returnTo);

        const authorizationParams: Record<string, string> = {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email offline_access',
        };
        if (errorCode === 'consent_required') authorizationParams.prompt = 'consent';

        loginWithRedirect({
          appState: { returnTo },
          authorizationParams,
        });
      } else {
        console.warn('Failed to get access token silently:', error);
      }
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
          const token = await getAccessToken();

          if (token) {
            const syncedUser = await userService.syncUser(token);
            setUserProfile(syncedUser);
            hasSyncedRef.current = true;
          } else {
          }
        } catch (error) {
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
    userProfile,
    loading: isLoading,
    login: (returnToPath?: string | React.MouseEvent | React.KeyboardEvent) => {
      const returnTo =
        typeof returnToPath === 'string' && returnToPath.length > 0
          ? returnToPath
          : window.location.pathname;

      sessionStorage.setItem('auth_return_to', returnTo);
      loginWithRedirect({
        appState: { returnTo },
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email',
        },
      });
    },
    logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
    getAccessToken,
  };

  // Wrap children with AuthContext.Provider
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
