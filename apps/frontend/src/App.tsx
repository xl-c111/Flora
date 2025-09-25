import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import ProductsPage from './pages/ProductsPage';
import { AuthCallback } from './pages/auth/AuthCallback';

function App() {
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    // Check if API is available
    checkAPIStatus();
  }, []);

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

              <div className="auth-section">
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
                    <span>Welcome, {user.email}</span>
                    <button
                      onClick={() => signOut()}
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
                    onClick={() => setShowLoginModal(true)}
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
              path="/auth/callback"
              element={<AuthCallback />}
            />
          </Routes>
        </main>

        {/* Login Modal */}
        {showLoginModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  zIndex: 1001,
                }}
              >
                ×
              </button>
              <LoginForm onSuccess={() => setShowLoginModal(false)} />
            </div>
          </div>
        )}

        <footer className="footer">
          <p>
            &copy; 2024 Flora - Holberton Demo Project by Anthony, Bevan,
            Xiaoling, and Lily
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
