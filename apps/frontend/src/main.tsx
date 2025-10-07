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

const onRedirectCallback = (appState?: { returnTo?: string }) => {
  // After Auth0 login, save the return path
  console.log('🔄 Auth0 redirect callback - appState:', appState);
  const returnTo = appState?.returnTo || '/';
  console.log('🔄 Saving returnTo:', returnTo);

  // Save to sessionStorage so App.tsx can handle navigation
  sessionStorage.setItem('auth_return_to', returnTo);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </Auth0Provider>
  </StrictMode>
);
