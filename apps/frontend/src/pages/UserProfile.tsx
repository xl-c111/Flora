import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import type { UserProfile as UserProfileData } from '../services/userService';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user: auth0User, loading: authLoading, getAccessToken } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth0User) {
        setLoading(false);
        return;
      }

      try {
        const token = await getAccessToken();
        console.log('🔑 UserProfile got token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        if (!token) throw new Error('No access token');

        console.log('📥 Fetching user profile from database');
        const profileData = await userService.getProfile(token);
        console.log('✅ Profile loaded:', profileData);

        setProfile(profileData);
        setPhoneValue(profileData.phone || '');
      } catch (err: any) {
        console.error('❌ Profile fetch error:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [auth0User, authLoading, getAccessToken]);

  // Save phone number
  const handleSavePhone = async () => {
    if (!phoneValue.trim()) {
      alert('Please enter a phone number');
      return;
    }

    try {
      setIsSaving(true);
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      console.log('💾 Saving phone number:', phoneValue);
      const updated = await userService.updateProfile(token, {
        phone: phoneValue,
      });

      setProfile(updated);
      setIsEditingPhone(false);
      console.log('✅ Phone number saved');
    } catch (err: any) {
      console.error('❌ Save error:', err);
      alert(err.message || 'Failed to save phone number');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel phone edit
  const handleCancelPhoneEdit = () => {
    setPhoneValue(profile?.phone || '');
    setIsEditingPhone(false);
  };

  // Loading states
  if (authLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!auth0User) {
    return (
      <div className="profile-not-logged-in">
        <h2>My Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            {auth0User.picture ? (
              <img
                src={auth0User.picture}
                alt={auth0User.name || 'User'}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {auth0User.name?.[0]?.toUpperCase() ||
                  auth0User.email?.[0]?.toUpperCase() ||
                  'U'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{auth0User.name || 'Welcome'}</h1>
            <p className="profile-email">{auth0User.email}</p>
            {auth0User.email_verified && (
              <span className="verified-badge">{'\u2713'} Verified</span>
            )}
          </div>
        </div>

        {/* User Statistics */}
        {profile?.stats && (
          <div className="user-stats-section">
            <div className="stat-card">
              <div className="stat-icon">{'\u{1F4E6}'}</div>
              <div className="stat-content">
                <p className="stat-value">{profile.stats.orderCount}</p>
                <p className="stat-label">Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">{'\u{1F504}'}</div>
              <div className="stat-content">
                <p className="stat-value">{profile.stats.subscriptionCount}</p>
                <p className="stat-label">Active Subscriptions</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">{'\u{1F4B5}'}</div>
              <div className="stat-content">
                <p className="stat-value">
                  {formatCurrency(profile.stats.totalSpentCents)}
                </p>
                <p className="stat-label">Total Spent</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <Link to="/orders" className="action-card">
              <div className="action-icon">{'\u{1F4E6}'}</div>
              <h3>Order History</h3>
              <p>View your past orders and track deliveries</p>
            </Link>

            <Link to="/subscriptions" className="action-card">
              <div className="action-icon">{'\u{1F504}'}</div>
              <h3>My Subscriptions</h3>
              <p>Manage your active subscriptions</p>
            </Link>

            <div className="action-card disabled">
              <div className="action-icon">{'\u{1F3E0}'}</div>
              <h3>Saved Addresses</h3>
              <p className="coming-soon">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="account-info-section">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{auth0User.name || 'Not provided'}</p>
            </div>

            <div className="info-item">
              <label>Email Address</label>
              <p>{auth0User.email}</p>
            </div>

            <div className="info-item">
              <label>Phone Number</label>
              {isEditingPhone ? (
                <div className="edit-phone-controls">
                  <input
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="phone-input"
                    disabled={isSaving}
                  />
                  <div className="edit-buttons">
                    <button
                      onClick={handleSavePhone}
                      className="save-btn"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelPhoneEdit}
                      className="cancel-btn"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="phone-display">
                  <p className={profile?.phone ? '' : 'not-set'}>
                    {profile?.phone || 'Not set yet'}
                  </p>
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="edit-btn"
                  >
                    {profile?.phone ? 'Edit' : 'Add'}
                  </button>
                </div>
              )}
              {!profile?.phone && !isEditingPhone && (
                <span className="info-hint">
                  Add your phone number for order updates
                </span>
              )}
            </div>

            <div className="info-item">
              <label>Member Since</label>
              <p>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })
                  : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Section - Coming Soon */}
        <div className="preferences-section">
          <h2>Your Preferences</h2>
          <p className="section-description">
            Help us personalize your experience by setting your preferences
          </p>

          <div className="preference-categories">
            <div className="preference-category disabled">
              <h3>Favorite Occasions</h3>
              <p>Birthday, Anniversary, Sympathy, etc.</p>
              <span className="coming-soon-tag">Coming Soon</span>
            </div>

            <div className="preference-category disabled">
              <h3>Favorite Colors</h3>
              <p>Red, Pink, White, Mixed, etc.</p>
              <span className="coming-soon-tag">Coming Soon</span>
            </div>

            <div className="preference-category disabled">
              <h3>Favorite Moods</h3>
              <p>Romantic, Cheerful, Elegant, etc.</p>
              <span className="coming-soon-tag">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
