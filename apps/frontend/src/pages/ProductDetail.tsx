import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_OPTIONS, calculateSubscriptionPrice, formatSubscriptionSavings } from '../config/subscriptionConfig';
import { apiService, getImageUrl } from '../services/api';
import type { Product } from '../types';
import '../styles/ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, login } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('monthly');
  const [quantity, setQuantity] = useState(1);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [similarProductsLoading, setSimilarProductsLoading] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use the specific getProduct method from apiService
        const productData = await apiService.getProduct(id);
        setProduct(productData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch similar products after main product is loaded
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product?.id) return;

      try {
        setSimilarProductsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products/${product.id}/similar`);
        const data = await response.json();

        if (data.products) {
          setSimilarProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setSimilarProductsLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [product?.id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatAttributes = (attributes: string[]): string => {
    return attributes
      .map((attr) => attr.charAt(0).toUpperCase() + attr.slice(1).toLowerCase())
      .join(', ');
  };

  const getDisplayPrice = () => {
    if (isSubscription) {
      const discountedPrice = calculateSubscriptionPrice(product.priceCents, selectedFrequency);
      return formatPrice(discountedPrice);
    }
    return formatPrice(product.priceCents);
  };

  const getSubscriptionInfo = () => {
    if (!isSubscription) return null;

    const option = SUBSCRIPTION_OPTIONS.find(opt => opt.frequency === selectedFrequency);
    const savings = formatSubscriptionSavings(product.priceCents, selectedFrequency);

    return (
      <div className="subscription-info">
        <span className="savings-badge">{savings} with subscription!</span>
        <span className="frequency-label">{option?.label}</span>
      </div>
    );
  };

  const handleAddToCart = () => {
    // Check authentication for subscription items
    if (isSubscription && !user) {
      setShowAuthPrompt(true);
      return;
    }

    const subscriptionDiscount = isSubscription
      ? SUBSCRIPTION_OPTIONS.find(opt => opt.frequency === selectedFrequency)?.discountPercentage
      : undefined;

    addItem({
      product,
      quantity,
      isSubscription,
      subscriptionFrequency: isSubscription ? selectedFrequency : undefined,
      subscriptionDiscount
    });

    const message = isSubscription
      ? `Added ${product.name} (${selectedFrequency} subscription) to cart!`
      : `Added ${product.name} to cart!`;

    alert(message);
    navigate('/cart');
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate('/products')} className="breadcrumb-link">
            Products
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Detail Content */}
        <div className="product-detail-content">
          {/* Product Image */}
          <div className="product-image-section">
            {product.imageUrl ? (
              <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
            ) : (
              <div className="image-placeholder">🌸</div>
            )}
          </div>

          {/* Product Details */}
          <div className="product-details-section">
            <h1 className="product-title">{product.name}</h1>

            {/* Price Display */}
            <div className="price-section">
              <div className="current-price">
                {getDisplayPrice()}
                {isSubscription && (
                  <span className="original-price">{formatPrice(product.priceCents)}</span>
                )}
              </div>
              {getSubscriptionInfo()}
            </div>

            {/* Description */}
            <div className="description-section">
              <p className="product-description">{product.description}</p>
            </div>

            {/* Attributes */}
            <div className="attributes-section">
              {product.occasions && product.occasions.length > 0 && (
                <div className="attribute-row">
                  <strong>Perfect for:</strong> {formatAttributes(product.occasions)}
                </div>
              )}
              {product.colors && product.colors.length > 0 && (
                <div className="attribute-row">
                  <strong>Colors:</strong> {formatAttributes(product.colors)}
                </div>
              )}
              {product.moods && product.moods.length > 0 && (
                <div className="attribute-row">
                  <strong>Mood:</strong> {formatAttributes(product.moods)}
                </div>
              )}
            </div>

            {/* Purchase Options */}
            <div className="purchase-options">
              <h3>Purchase Options</h3>

              {/* One-time vs Subscription Toggle */}
              <div className="purchase-type-toggle">
                <label className={`toggle-option ${!isSubscription ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="purchaseType"
                    checked={!isSubscription}
                    onChange={() => setIsSubscription(false)}
                  />
                  One-time Purchase
                </label>
                <label className={`toggle-option ${isSubscription ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="purchaseType"
                    checked={isSubscription}
                    onChange={() => setIsSubscription(true)}
                  />
                  Subscribe & Save
                </label>
              </div>

              {/* Subscription Frequency Options */}
              {isSubscription && (
                <div className="frequency-options">
                  <h4>Delivery Frequency</h4>
                  {SUBSCRIPTION_OPTIONS.map(option => (
                    <label key={option.frequency} className={`frequency-option ${selectedFrequency === option.frequency ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="frequency"
                        value={option.frequency}
                        checked={selectedFrequency === option.frequency}
                        onChange={(e) => setSelectedFrequency(e.target.value as any)}
                      />
                      <div className="option-details">
                        <span className="option-label">{option.label}</span>
                        <span className="option-description">{option.description}</span>
                        <span className="option-price">
                          {formatPrice(calculateSubscriptionPrice(product.priceCents, option.frequency))}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="quantity-section">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="quantity-input"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="similar-products-section">
            <h2 className="similar-products-title">Products you may also like</h2>
            <div className="similar-products-grid">
              {similarProducts.slice(0, 3).map((similarProduct) => (
                <div key={similarProduct.id} className="similar-product-card">
                  <div
                    className="similar-product-image"
                    onClick={() => navigate(`/products/${similarProduct.id}`)}
                  >
                    {similarProduct.imageUrl ? (
                      <img src={getImageUrl(similarProduct.imageUrl)} alt={similarProduct.name} />
                    ) : (
                      <div className="similar-product-placeholder">🌸</div>
                    )}
                  </div>
                  <div className="similar-product-info">
                    <h3
                      className="similar-product-name"
                      onClick={() => navigate(`/products/${similarProduct.id}`)}
                    >
                      {similarProduct.name}
                    </h3>
                    <p className="similar-product-price">
                      ${(similarProduct.priceCents / 100).toFixed(2)}
                    </p>
                    <div className="similar-product-actions">
                      <button
                        className="similar-product-view-btn"
                        onClick={() => navigate(`/products/${similarProduct.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className="similar-product-quick-add-btn"
                        onClick={() => {
                          addItem({
                            product: similarProduct,
                            quantity: 1,
                            isSubscription: false
                          });
                          alert(`Added ${similarProduct.name} to cart!`);
                        }}
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="auth-prompt-overlay" onClick={() => setShowAuthPrompt(false)}>
          <div className="auth-prompt-modal" onClick={e => e.stopPropagation()}>
            <div className="auth-prompt-content">
              <h3>🔐 Login Required</h3>
              <p>You need to be signed in to add subscription items to your cart.</p>
              <div className="auth-prompt-actions">
                <button
                  className="auth-prompt-login-btn"
                  onClick={() => {
                    setShowAuthPrompt(false);
                    login();
                  }}
                >
                  Sign In
                </button>
                <button
                  className="auth-prompt-cancel-btn"
                  onClick={() => setShowAuthPrompt(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;