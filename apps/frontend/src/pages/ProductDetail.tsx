import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_OPTIONS, calculateSubscriptionPrice, formatSubscriptionSavings } from '../config/subscriptionConfig';
import { apiService, getImageUrl } from '../services/api';
import type { Product } from '../types';
import DatePicker from '../components/DatePicker';
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
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'recurring' | 'spontaneous'>('one-time');
  const [likesCount] = useState(256); // Placeholder for likes feature
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Toggle accordion sections
  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

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
      purchaseType,
      subscriptionFrequency: isSubscription ? selectedFrequency : undefined,
      subscriptionDiscount,
      selectedDate
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
            {/* Header: Title, Price, Likes */}
            <div className="product-header">
              <div className="header-top">
                <h1 className="product-title">{product.name}</h1>
                <div className="product-price">{formatPrice(product.priceCents)}</div>
              </div>
              <div className="likes-count">{likesCount} Likes</div>
            </div>

            {/* Description */}
            <div className="description-section">
              <p className="product-description">{product.description}</p>

              <p className="product-description">
                Daffodils, the heart of this bouquet, are nature's timeless symbol of new beginnings and hope. Paired with daisies and airy accents, this arrangement celebrates the season of growth, when the world awakens from winter's rest and blossoms with possibility.
              </p>

              <p className="product-description">
                Perfect for brightening your home, office, or loved one, or celebrating a fresh chapter, this bouquet isn't just flowers—it's a reminder that every season brings renewal and light.
              </p>
            </div>

            {/* Select a Delivery Date */}
            <div className="date-selector-section">
              <h3>Select a Delivery Date</h3>
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                minDaysFromNow={1}
                maxDaysFromNow={90}
              />
            </div>

            {/* Select a Purchase Type */}
            <div className="purchase-type-section">
              <h3>Select a Purchase Type</h3>

              {/* Three Purchase Type Options */}
              <div className="purchase-type-grid">
                {/* One-time Purchase */}
                <button
                  className={`purchase-type-btn ${purchaseType === 'one-time' ? 'active' : ''}`}
                  onClick={() => {
                    setPurchaseType('one-time');
                    setIsSubscription(false);
                  }}
                >
                  One-time
                </button>

                {/* Recurring Subscription */}
                <button
                  className={`purchase-type-btn ${purchaseType === 'recurring' ? 'active' : ''}`}
                  onClick={() => {
                    setPurchaseType('recurring');
                    setIsSubscription(true);
                  }}
                >
                  Reoccurring Subscription
                </button>

                {/* Spontaneous Subscription */}
                <button
                  className={`purchase-type-btn ${purchaseType === 'spontaneous' ? 'active' : ''}`}
                  onClick={() => {
                    setPurchaseType('spontaneous');
                    setIsSubscription(true);
                  }}
                >
                  Spontaneous Subscription
                </button>
              </div>

              {/* Frequency Options for Recurring Subscription */}
              {purchaseType === 'recurring' && (
                <div className="frequency-selector">
                  {SUBSCRIPTION_OPTIONS.map(option => (
                    <label
                      key={option.frequency}
                      className={`frequency-option-card ${selectedFrequency === option.frequency ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={option.frequency}
                        checked={selectedFrequency === option.frequency}
                        onChange={(e) => setSelectedFrequency(e.target.value as any)}
                      />
                      <div className="frequency-option-details">
                        <span className="frequency-option-label">{option.label}</span>
                        <span className="frequency-option-description">{option.description}</span>
                        <span className="frequency-option-savings">
                          {formatSubscriptionSavings(product.priceCents, option.frequency)} with subscription
                        </span>
                      </div>
                      <div className="frequency-option-price">
                        {formatPrice(calculateSubscriptionPrice(product.priceCents, option.frequency))}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Frequency Options for Spontaneous Subscription */}
              {purchaseType === 'spontaneous' && (
                <div className="frequency-selector">
                  {SUBSCRIPTION_OPTIONS.map(option => (
                    <label
                      key={option.frequency}
                      className={`frequency-option-card ${selectedFrequency === option.frequency ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="frequency-spontaneous"
                        value={option.frequency}
                        checked={selectedFrequency === option.frequency}
                        onChange={(e) => setSelectedFrequency(e.target.value as any)}
                      />
                      <div className="frequency-option-details">
                        <span className="frequency-option-label">{option.label}</span>
                        <span className="frequency-option-description">{option.description}</span>
                        <span className="frequency-option-savings">
                          {formatSubscriptionSavings(product.priceCents, option.frequency)} with subscription
                        </span>
                      </div>
                      <div className="frequency-option-price">
                        {formatPrice(calculateSubscriptionPrice(product.priceCents, option.frequency))}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? (() => {
                // Calculate dynamic price based on purchase type
                if (purchaseType === 'one-time') {
                  return `Add to Cart - ${formatPrice(product.priceCents)}`;
                } else {
                  // For subscriptions (recurring or spontaneous)
                  const discountedPrice = calculateSubscriptionPrice(product.priceCents, selectedFrequency);
                  return `Add to Cart - ${formatPrice(discountedPrice)}`;
                }
              })() : 'Out of Stock'}
            </button>

            {/* Accordion Sections */}
            <div className="accordion-sections">
              {/* Subscription Types */}
              <div className="accordion-item">
                <button
                  className={`accordion-header ${openAccordion === 'subscription' ? 'active' : ''}`}
                  onClick={() => toggleAccordion('subscription')}
                >
                  <span>Subscription Types</span>
                  <span className="accordion-icon">{openAccordion === 'subscription' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'subscription' && (
                  <div className="accordion-content">
                    <h4>Reoccurring Subscription</h4>
                    <p>
                      Bring beauty and joy into your everyday with our flower subscription service. Whether
                      you're treating yourself, brightening your home, or surprising someone special, our
                      handcrafted bouquets arrive fresh and full of seasonal charm—right to your door.
                    </p>
                    <p>
                      Choose the plan that fits your lifestyle: weekly, bi-weekly, or monthly deliveries,
                      available in petite, standard, or lux sizes. Each arrangement is thoughtfully designed by
                      our florists using the freshest blooms of the season, ensuring every delivery feels unique
                      and special.
                    </p>
                    <p>
                      Let us take care of the details, so you can simply enjoy the beauty. Your next bouquet is
                      just a subscription away.
                    </p>

                    <h4>Spontaneous Subscription</h4>
                    <p>
                      Love surprises? Our spontaneous subscription is made for your loved one. Instead of a
                      set delivery day, you'll choose how often you'd like flowers—weekly, fortnightly, or
                      monthly—and we'll surprise your loved one with a beautiful bouquet on a random day
                      within that timeframe.
                    </p>
                    <p>
                      It's the perfect way to keep life blooming with unexpected joy. They'll never know
                      exactly when your flowers will arrive, but they can always count on them to be fresh,
                      seasonal, and thoughtfully arranged by our florists.
                    </p>
                    <p>
                      Bring a little mystery (and a lot of beauty) into their routine with flowers that show up
                      when they least expect them—but always right on time to brighten their day.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery */}
              <div className="accordion-item">
                <button
                  className={`accordion-header ${openAccordion === 'delivery' ? 'active' : ''}`}
                  onClick={() => toggleAccordion('delivery')}
                >
                  <span>Delivery</span>
                  <span className="accordion-icon">{openAccordion === 'delivery' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'delivery' && (
                  <div className="accordion-content">
                    <p>
                      We deliver fresh flowers straight to your door for a flat fee of $19.95. Place your order
                      before 10:00 AM and enjoy same-day delivery—perfect for birthdays, anniversaries, or
                      just because.
                    </p>
                    <p>Reliable, fast, and always handled with care.</p>
                  </div>
                )}
              </div>

              {/* Different Everyday */}
              <div className="accordion-item">
                <button
                  className={`accordion-header ${openAccordion === 'different' ? 'active' : ''}`}
                  onClick={() => toggleAccordion('different')}
                >
                  <span>Different Everyday</span>
                  <span className="accordion-icon">{openAccordion === 'different' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'different' && (
                  <div className="accordion-content">
                    <p>
                      We work with the freshest flowers available each day, which means your bouquet may
                      not look exactly like the photos shown. Flower types, colors, and arrangements can vary
                      depending on seasonal availability and supply.
                    </p>
                    <p>
                      What never changes is our promise: every bouquet is thoughtfully designed by our
                      florists to be fresh, beautiful, and full of charm—no matter the season.
                    </p>
                  </div>
                )}
              </div>
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