import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import './Header.css';

const Header: React.FC = () => {
  const { getItemCount } = useCart();
  const { user, login, logout, loading: authLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Navigation and search functionality
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get('search') || '';

  // Handle search from SearchBar component
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="flora-header flora-header-sticky">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="top-nav-links">
          <div className="header-search-wrapper">
            <SearchBar
              onSearchChange={handleSearch}
              currentSearch={currentSearch}
            />
          </div>
          <Link to="/contact" className="top-nav-link">Contact Us</Link>
          {authLoading ? (
            <span className="top-nav-link">Loading...</span>
          ) : user ? (
            <div className="user-menu-wrapper" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="top-nav-link auth-button user-menu-button"
              >
                <span className="user-avatar-small">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name || 'User'} />
                  ) : (
                    <span className="avatar-text">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </span>
                <span className="user-name-text">
                  {user.name?.split(' ')[0] || 'Account'}
                </span>
                <svg
                  className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    Order History
                  </Link>
                  <Link
                    to="/subscriptions"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                    My Subscriptions
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="dropdown-item logout-item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={login} className="top-nav-link auth-button">
              Log In
            </button>
          )}
          <Link to="/cart" className="cart-icon-wrapper">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="cart-counter">{getItemCount()}</span>
          </Link>
        </div>
      </div>

      {/* Main Menu Bar */}
      {/* <nav className="main-menu">
        <Link to="/products" className="menu-link">Shop All Flowers</Link>
        <Link to="/products?filter=colour" className="menu-link">Shop By Colour</Link>
        <Link to="/products?filter=occasion" className="menu-link">Shop By Occasion</Link>
        <Link to="/bundles" className="menu-link">Bundle Up and Save</Link>
      </nav> */}

      {/* Floral Background Section */}
      {/* <div className="floral-background">
        <svg className="floral-illustration" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice"> */}
          {/* Subtle floral illustrations */}
          {/* <defs>
            <linearGradient id="floral-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#f5f5f0', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#e8f0e8', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f5f5f0', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect width="1200" height="200" fill="url(#floral-gradient)" /> */}

          {/* Rose illustrations */}
          {/* <g opacity="0.15" fill="#7a9b7a"> */}
            {/* Left rose */}
            {/* <circle cx="150" cy="100" r="30" />
            <circle cx="140" cy="90" r="15" />
            <circle cx="160" cy="95" r="18" />
            <path d="M 150 130 Q 145 160, 140 180" stroke="#7a9b7a" strokeWidth="3" fill="none" />
            <path d="M 135 145 Q 120 150, 110 155" stroke="#7a9b7a" strokeWidth="2" fill="none" /> */}

            {/* Right rose */}
            {/* <circle cx="1050" cy="120" r="35" />
            <circle cx="1040" cy="105" r="18" />
            <circle cx="1065" cy="110" r="20" />
            <path d="M 1050 155 Q 1055 175, 1060 190" stroke="#7a9b7a" strokeWidth="3" fill="none" />
            <path d="M 1070 140 Q 1085 145, 1095 150" stroke="#7a9b7a" strokeWidth="2" fill="none" /> */}

            {/* Center small flowers */}
            {/* <circle cx="600" cy="80" r="25" />
            <circle cx="595" cy="70" r="12" />
            <circle cx="610" cy="75" r="14" />
          </g> */}

          {/* Leaves and stems */}
          {/* <g opacity="0.1" stroke="#7a9b7a" strokeWidth="2" fill="none">
            <path d="M 300 160 Q 320 140, 340 130 Q 360 120, 380 115" />
            <ellipse cx="330" cy="145" rx="15" ry="8" transform="rotate(-30 330 145)" fill="#a8c5a8" />
            <ellipse cx="360" cy="125" rx="15" ry="8" transform="rotate(-40 360 125)" fill="#a8c5a8" />

            <path d="M 800 150 Q 820 130, 840 120 Q 860 110, 880 105" />
            <ellipse cx="830" cy="135" rx="15" ry="8" transform="rotate(30 830 135)" fill="#a8c5a8" />
            <ellipse cx="860" cy="115" rx="15" ry="8" transform="rotate(40 860 115)" fill="#a8c5a8" />
          </g>
        </svg>
      </div> */}

      {/* Secondary Menu Bar */}
      {/* <nav className="secondary-menu">
        <Link to="/products?category=romantic" className="secondary-link">Romantic / Love</Link>
        <Link to="/products?category=cheerful" className="secondary-link">Cheerful / Everyday Joy</Link>
        <Link to="/products?category=elegant" className="secondary-link">Elegant / Sophisticated</Link>
        <Link to="/products?category=seasonal" className="secondary-link">Seasonal / Nature Inspired</Link>
        <Link to="/products?category=special" className="secondary-link">Special Occasion</Link>
      </nav> */}

      <div className="banner-container" 
                style={{
                  width: 'auto',
                  /* height: 240px; */
                  /* background-color:blue; */
                  // marginBottom: '5rem',
                }}>
                  <div className="banner-menu">
                      <ul>
                          <li>
                              <Link to="/products">Shop All Flowers</Link>
                          </li>
                          <li>
                              <Link to="/products?filter=colour">Shop By Colour</Link>
                          </li>
                          <li>
                              <Link to="/products?filter=occasion">Shop By Occasion</Link>
                          </li>
                          <li>
                              <Link to="/bundles">Bundle Up and Save</Link>
                          </li>
                      </ul>
                  </div>
                  <div className="banner-image">
                  </div>
                  <div className="banner-menu">
                      <ul>
                        <li>
                              <Link to="/products?category=romantic">Romantic / Love</Link>
                        </li>
                        <li>
                              <Link to="/products?category=cheerful">Cheerful / Everyday Joy</Link>
                        </li>
                        <li>
                              <Link to="/products?category=elegant">Elegant / Sophisticated</Link>
                        </li>
                        <li>
                              <Link to="/products?category=seasonal">Seasonal / Nature Inspired</Link>
                        </li>
                        <li>
                              <Link to="/products?category=special">Special Occasion</Link>
                        </li>
                      </ul>
                  </div>
              </div>
    </header>
  );
};

export default Header;
