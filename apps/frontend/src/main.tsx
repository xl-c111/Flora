import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true';

const onRedirectCallback = (appState?: { returnTo?: string }) => {
  // After Auth0 login, save the return path
  const returnTo = appState?.returnTo || '/';

  // Save to sessionStorage so App.tsx can handle navigation
  sessionStorage.setItem('auth_return_to', returnTo);
};

const AppContent = () => (
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAuthDisabled ? (
      <AppContent />
    ) : (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: audience,
          scope: 'openid profile email',
        }}
        onRedirectCallback={onRedirectCallback}
      >
        <AppContent />
      </Auth0Provider>
    )}
  </StrictMode>
);
