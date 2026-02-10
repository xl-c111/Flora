import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
function App() {
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(false);

  useEffect(() => {
    // Check if API is available
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

      const response = await fetch(`${apiUrl}/health`);

      if (response.ok) {
        setUseAPI(true);
      } else {
        setUseAPI(false);
      }
    } catch (err) {
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
      <AppContent useAPI={useAPI} />
    </BrowserRouter>
  );
}

function AppContent({ useAPI }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: auth0Loading, isAuthenticated } = useAuth0();

  // Check if we're on the order confirmation or checkout page
  const hideHeaderFooter =
    location.pathname.startsWith("/order-confirmation") || location.pathname.startsWith("/checkout");

  useEffect(() => {
    // Handle Auth0 redirect callback - wait until Auth0 finishes processing
    if (!auth0Loading && isAuthenticated) {
      const returnTo = sessionStorage.getItem("auth_return_to");

      if (returnTo) {
        sessionStorage.removeItem("auth_return_to");

        // Small delay to ensure Auth0 has fully processed
        setTimeout(() => {
          navigate(returnTo, { replace: true });
        }, 100);
      }
    }
  }, [auth0Loading, isAuthenticated, navigate]);

  return (
    <div className="app">
      {/* Hide header on order confirmation and checkout pages */}
      {!hideHeaderFooter && <Header isLanding={false} />}

      {!useAPI && <div className="demo-badge">🚧 Demo Mode - API Not Available</div>}
      <main className="main">
        {/* Define app routes. AuthCallback is not needed with Auth0 React SDK */}
        <Suspense fallback={<div className="loading">🌸 Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Hide footer on order confirmation and checkout pages */}
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}
export default App;
