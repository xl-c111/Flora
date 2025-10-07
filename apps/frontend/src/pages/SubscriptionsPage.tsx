import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../services/api';
import apiService from '../services/api';
import '../styles/SubscriptionsPage.css';

interface SubscriptionItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    priceCents: number;
  };
}

interface Subscription {
  id: string;
  type: string;
  status: string;
  nextDeliveryDate: string | null;
  lastDeliveryDate: string | null;
  deliveryType: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  items: SubscriptionItem[];
}

const SubscriptionsPage = () => {
  const { getAccessToken, user, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('No access token found');

        console.log('🔑 Fetching subscriptions with token');
        const response = await apiService.getSubscriptions(token);
        console.log('📋 Subscriptions response:', response);

        setSubscriptions(response.data || []);
      } catch (err: any) {
        console.error('❌ Subscriptions error:', err);
        setError(`Failed to load subscriptions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubscriptions();
    }
  }, [getAccessToken, user, authLoading]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'status-active';
    if (statusLower === 'paused') return 'status-paused';
    if (statusLower === 'cancelled') return 'status-cancelled';
    return 'status-pending';
  };

  const getStatusDisplay = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getSubscriptionTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'RECURRING_WEEKLY': '🔄 Weekly',
      'RECURRING_BIWEEKLY': '🔄 Biweekly',
      'RECURRING_MONTHLY': '🔄 Monthly',
      'SPONTANEOUS': '✨ Spontaneous',
    };
    return typeMap[type] || type;
  };

  if (authLoading) {
    return (
      <div className="subscriptions-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="subscriptions-not-logged-in">
        <h2>My Subscriptions</h2>
        <p>Please log in to view your subscriptions.</p>
        <Link to="/products" className="browse-products-btn">
          Browse Products
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="subscriptions-loading">
        <div className="spinner"></div>
        <p>Loading your subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscriptions-error">
        <h2>Error Loading Subscriptions</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      <div className="subscriptions-container">
        <div className="subscriptions-header">
          <h1>My Subscriptions</h1>
          <p className="subscription-count">
            {subscriptions.length === 0
              ? 'No active subscriptions'
              : `${subscriptions.length} ${subscriptions.length === 1 ? 'subscription' : 'subscriptions'}`}
          </p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="no-subscriptions">
            <div className="no-subscriptions-icon">{'\u{1F504}'}</div>
            <h2>No Subscriptions Yet</h2>
            <p>Subscribe to your favorite flowers for recurring deliveries.</p>
            <Link to="/products" className="browse-products-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="subscriptions-list">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="subscription-card">
                <div className="subscription-card-header">
                  <div className="subscription-info-left">
                    <h3 className="subscription-type">
                      {getSubscriptionTypeDisplay(subscription.type)}
                    </h3>
                    <p className="subscription-created">
                      Started {formatDate(subscription.createdAt)}
                    </p>
                  </div>
                  <div className="subscription-info-right">
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        subscription.status
                      )}`}
                    >
                      {getStatusDisplay(subscription.status)}
                    </span>
                  </div>
                </div>

                <div className="subscription-card-body">
                  <div className="subscription-items">
                    {subscription.items.map((item) => (
                      <div key={item.id} className="subscription-item-preview">
                        {item.product.imageUrl ? (
                          <img
                            src={getImageUrl(item.product.imageUrl)}
                            alt={item.product.name}
                            className="item-thumbnail"
                          />
                        ) : (
                          <div className="item-thumbnail-placeholder">
                            {'\u{1F338}'}
                          </div>
                        )}
                        <div className="item-preview-info">
                          <p className="item-name">{item.product.name}</p>
                          <p className="item-quantity">Qty: {item.quantity}</p>
                          <p className="item-price">
                            {formatPrice(item.product.priceCents)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="subscription-details">
                    <div className="detail-row">
                      <span className="label">Delivery:</span>
                      <span className="value">
                        {getStatusDisplay(subscription.deliveryType)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Next Delivery:</span>
                      <span className="value next-delivery">
                        {formatDate(subscription.nextDeliveryDate)}
                      </span>
                    </div>
                    {subscription.lastDeliveryDate && (
                      <div className="detail-row">
                        <span className="label">Last Delivery:</span>
                        <span className="value">
                          {formatDate(subscription.lastDeliveryDate)}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Ship To:</span>
                      <span className="value">
                        {subscription.shippingCity}, {subscription.shippingState}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="subscription-card-footer">
                  <div className="subscription-actions">
                    {subscription.status === 'ACTIVE' ? (
                      <>
                        <button className="action-btn pause-btn" disabled>
                          ⏸ Pause
                        </button>
                        <button className="action-btn skip-btn" disabled>
                          ⏭ Skip Next
                        </button>
                      </>
                    ) : subscription.status === 'PAUSED' ? (
                      <button className="action-btn resume-btn" disabled>
                        ▶ Resume
                      </button>
                    ) : null}
                    <button className="action-btn cancel-btn" disabled>
                      🗑 Cancel
                    </button>
                    <span className="coming-soon-text">
                      (Actions coming soon)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
