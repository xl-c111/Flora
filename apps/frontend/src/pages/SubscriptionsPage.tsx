import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const SubscriptionsPage = () => {
  const { getAccessToken, user, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      // Don't fetch if user isn't authenticated
      if (!user) {
        setError('Please log in to view subscriptions');
        setLoading(false);
        return;
      }

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('No access token found');

        console.log('🔑 Fetching subscriptions with token:', token);
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

    // Only fetch when not loading auth and we have a user
    if (!authLoading) {
      fetchSubscriptions();
    }
  }, [getAccessToken, user, authLoading]);

  if (authLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Your Subscriptions</h2>
        <p>Please log in to view your subscriptions.</p>
      </div>
    );
  }

  if (loading) return <div>Loading subscriptions...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>Your Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <p>No subscriptions found.</p>
      ) : (
        <ul>
          {subscriptions.map((sub: any) => (
            <li key={sub.id}>
              <strong>{sub.planName || sub.id}</strong> - Status: {sub.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SubscriptionsPage;
