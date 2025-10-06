import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { getItemCount } = useCart();
  const { user, login, logout, loading: authLoading } = useAuth();
  const location = useLocation();

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/' || location.pathname === '/products';
  const headerClass = isHomePage ? 'flora-header' : 'flora-header flora-header-sticky';

  return (
    <header className={headerClass}>
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="top-nav-links">
          <Link to="/products" className="top-nav-link">Search</Link>
          <Link to="/contact" className="top-nav-link">Contact Us</Link>
          {authLoading ? (
            <span className="top-nav-link">Loading...</span>
          ) : user ? (
            <button onClick={logout} className="top-nav-link auth-button">
              Log Out ({user.email})
            </button>
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
      <nav className="main-menu">
        <Link to="/products" className="menu-link">Shop All Flowers</Link>
        <Link to="/products?filter=colour" className="menu-link">Shop By Colour</Link>
        <Link to="/products?filter=occasion" className="menu-link">Shop By Occasion</Link>
        <Link to="/bundles" className="menu-link">Bundle Up and Save</Link>
      </nav>

      {/* Floral Background Section */}
      <div className="floral-background">
        <svg className="floral-illustration" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice">
          {/* Subtle floral illustrations */}
          <defs>
            <linearGradient id="floral-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#f5f5f0', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#e8f0e8', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f5f5f0', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect width="1200" height="200" fill="url(#floral-gradient)" />

          {/* Rose illustrations */}
          <g opacity="0.15" fill="#7a9b7a">
            {/* Left rose */}
            <circle cx="150" cy="100" r="30" />
            <circle cx="140" cy="90" r="15" />
            <circle cx="160" cy="95" r="18" />
            <path d="M 150 130 Q 145 160, 140 180" stroke="#7a9b7a" strokeWidth="3" fill="none" />
            <path d="M 135 145 Q 120 150, 110 155" stroke="#7a9b7a" strokeWidth="2" fill="none" />

            {/* Right rose */}
            <circle cx="1050" cy="120" r="35" />
            <circle cx="1040" cy="105" r="18" />
            <circle cx="1065" cy="110" r="20" />
            <path d="M 1050 155 Q 1055 175, 1060 190" stroke="#7a9b7a" strokeWidth="3" fill="none" />
            <path d="M 1070 140 Q 1085 145, 1095 150" stroke="#7a9b7a" strokeWidth="2" fill="none" />

            {/* Center small flowers */}
            <circle cx="600" cy="80" r="25" />
            <circle cx="595" cy="70" r="12" />
            <circle cx="610" cy="75" r="14" />
          </g>

          {/* Leaves and stems */}
          <g opacity="0.1" stroke="#7a9b7a" strokeWidth="2" fill="none">
            <path d="M 300 160 Q 320 140, 340 130 Q 360 120, 380 115" />
            <ellipse cx="330" cy="145" rx="15" ry="8" transform="rotate(-30 330 145)" fill="#a8c5a8" />
            <ellipse cx="360" cy="125" rx="15" ry="8" transform="rotate(-40 360 125)" fill="#a8c5a8" />

            <path d="M 800 150 Q 820 130, 840 120 Q 860 110, 880 105" />
            <ellipse cx="830" cy="135" rx="15" ry="8" transform="rotate(30 830 135)" fill="#a8c5a8" />
            <ellipse cx="860" cy="115" rx="15" ry="8" transform="rotate(40 860 115)" fill="#a8c5a8" />
          </g>
        </svg>
      </div>

      {/* Secondary Menu Bar */}
      <nav className="secondary-menu">
        <Link to="/products?category=romantic" className="secondary-link">Romantic / Love</Link>
        <Link to="/products?category=cheerful" className="secondary-link">Cheerful / Everyday Joy</Link>
        <Link to="/products?category=elegant" className="secondary-link">Elegant / Sophisticated</Link>
        <Link to="/products?category=seasonal" className="secondary-link">Seasonal / Nature Inspired</Link>
        <Link to="/products?category=special" className="secondary-link">Special Occasion</Link>
      </nav>
    </header>
  );
};

export default Header;
