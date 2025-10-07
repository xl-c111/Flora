import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="flora-footer">
      {/* Acknowledgment Section */}
      <div className="acknowledgment-section">
        <div className="flags">
          <svg className="aboriginal-flag" viewBox="0 0 60 40" width="40" height="27">
            <rect width="60" height="20" fill="#000000" />
            <rect y="20" width="60" height="20" fill="#E03C31" />
            <circle cx="30" cy="20" r="8" fill="#FFCD00" />
          </svg>
          <svg className="torres-strait-flag" viewBox="0 0 60 40" width="40" height="27">
            <rect width="60" height="40" fill="#0F47AF" />
            <g>
              <line x1="0" y1="8" x2="60" y2="8" stroke="#000000" strokeWidth="3" />
              <line x1="0" y1="32" x2="60" y2="32" stroke="#000000" strokeWidth="3" />
            </g>
            <g fill="#FFFFFF">
              <polygon points="15,20 18,18 21,20 20,16.5 23,14.5 19.5,14.5 18,11 16.5,14.5 13,14.5 16,16.5" />
              <polygon points="45,20 48,18 51,20 50,16.5 53,14.5 49.5,14.5 48,11 46.5,14.5 43,14.5 46,16.5" />
              <polygon points="30,12 33,10 36,12 35,8.5 38,6.5 34.5,6.5 33,3 31.5,6.5 28,6.5 31,8.5" />
              <polygon points="30,28 33,26 36,28 35,24.5 38,22.5 34.5,22.5 33,19 31.5,22.5 28,22.5 31,24.5" />
              <polygon points="21,28 24,26 27,28 26,24.5 29,22.5 25.5,22.5 24,19 22.5,22.5 19,22.5 22,24.5" />
            </g>
            <circle cx="30" cy="20" r="5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="30" y1="15" x2="30" y2="10" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="30" y1="25" x2="30" y2="30" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
        </div>
        <p className="acknowledgment-text">
          Flora acknowledges the Traditional Owners of Country throughout Australia and acknowledges
          their continuing connection to land, waters and community. We pay our respects to the people,
          the cultures and the Elders past and present.
        </p>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        {/* Brand Name */}
        <div className="footer-brand">
          <h2>Flora</h2>
        </div>

        {/* Navigation Links */}
        <div className="footer-links">
          <div className="footer-links-column">
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/faqs" className="footer-link">FAQs</Link>
            <Link to="/terms" className="footer-link">T&C's</Link>
          </div>
          <div className="footer-links-column">
            <Link to="/refund" className="footer-link">Refund Policy</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
