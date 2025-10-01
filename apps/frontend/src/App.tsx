import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './contexts/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useCart } from './contexts/CartContext';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import SubscriptionsPage from './pages/SubscriptionsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/Checkout';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

function App() {
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(false);
  const {
    user,
    login,
    logout,
    loading: authLoading,
    getAccessToken,
  } = useAuth();
  const { getItemCount } = useCart();

  useEffect(() => {
    // Check if API is available
    checkAPIStatus();
  }, []);

  useEffect(() => {
    if (user) {
      getAccessToken().then((token) => {
        if (token) {
          console.log('Auth0 token: ', token);
        } else {
          console.log('No Auth0 token found');
        }
      });
    }
  }, [user, getAccessToken]);

  const checkAPIStatus = async () => {
    try {
      setLoading(true);
      const apiUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      console.log('🔍 Checking API status:', `${apiUrl}/health`);

      const response = await fetch(`${apiUrl}/health`);

      if (response.ok) {
        console.log('✅ API is available');
        setUseAPI(true);
      } else {
        console.log('ℹ️ API not responding properly');
        setUseAPI(false);
      }
    } catch (err) {
      console.log('ℹ️ API not available:', err);
      setUseAPI(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">🌸 Loading Flora marketplace...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppContent
        loading={loading}
        useAPI={useAPI}
        user={user}
        authLoading={authLoading}
        login={login}
        logout={logout}
        getItemCount={getItemCount}
      />
    </BrowserRouter>
  );
}

function AppContent({ loading, useAPI, user, authLoading, login, logout, getItemCount }: any) {
  const navigate = useNavigate();
  const { isLoading: auth0Loading, isAuthenticated } = useAuth0();

  useEffect(() => {
    // Handle Auth0 redirect callback - wait until Auth0 finishes processing
    if (!auth0Loading && isAuthenticated) {
      const returnTo = sessionStorage.getItem('auth_return_to');

      if (returnTo) {
        console.log('📍 Navigating to saved location:', returnTo);
        sessionStorage.removeItem('auth_return_to');

        // Small delay to ensure Auth0 has fully processed
        setTimeout(() => {
          navigate(returnTo, { replace: true });
        }, 100);
      }
    }
  }, [auth0Loading, isAuthenticated, navigate]);

  return (
      <div className="app">
        <header className="header">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Link
                to="/"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h1>🌸 Flora</h1>
                <p>Flowers & Plants Marketplace</p>
              </Link>
            </div>

            <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link
                to="/products"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                Browse Products
              </Link>

              <Link
                to="/cart"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#7a2e4a',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                🛒 Cart
                {getItemCount() > 0 && (
                  <span style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}>
                    {getItemCount()}
                  </span>
                )}
              </Link>

              <div className="auth-section">
                {/* Show loading spinner while Auth0 is loading */}
                {authLoading ? (
                  <div>Loading...</div>
                ) : user ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    {/* Show user's email from Auth0 profile */}
                    <span>Welcome, {user.email}</span>
                    <button
                      onClick={logout}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={login}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </nav>
          </div>

          {!useAPI && (
            <div className="demo-badge">🚧 Demo Mode - API Not Available</div>
          )}
        </header>

        <main className="main">
          {/* Define app routes. AuthCallback is not needed with Auth0 React SDK */}
          <Routes>
            <Route
              path="/"
              element={<ProductsPage />}
            />
            <Route
              path="/products"
              element={<ProductsPage />}
            />
            <Route
              path="/products/:id"
              element={<ProductDetail />}
            />
            <Route
              path="/subscriptions"
              element={<SubscriptionsPage />}
            />
            <Route
              path="/cart"
              element={<CartPage />}
            />
            <Route
              path="/checkout"
              element={<CheckoutPage />}
            />
            <Route
              path="/order-confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>
            &copy; 2025 Flora - Holberton Demo Project by Anthony, Bevan,
            Xiaoling, and Lily
          </p>
        </footer>
      </div>
  );
}

export default App;
