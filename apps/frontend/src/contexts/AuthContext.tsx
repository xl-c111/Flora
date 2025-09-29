// AuthContext provides authentication state and actions using Auth0
import React, { createContext, useContext } from 'react';
import { useAuth0, User as Auth0User } from '@auth0/auth0-react';

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
// to other compone
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // useAuth0 gives us all Auth0 authentication state and actions
  const { user, isLoading, loginWithRedirect, logout, getAccessTokenSilently } =
    useAuth0();

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

  // Provide login and logout actions
  // Note: logout() will redirect to the default Auth0 logout page and then back to your app
  const value: AuthContextType = {
    user,
    loading: isLoading,
    login: () => loginWithRedirect(),
    logout: () => logout(),
    getAccessToken,
  };

  // Wrap children with AuthContext.Provider
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
