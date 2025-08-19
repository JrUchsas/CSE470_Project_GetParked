import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleView = () => {
    if (!user || user.role !== 'admin') return;
    if (window.location.pathname === '/admin') {
      navigate('/');
    } else {
      navigate('/admin');
    }
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/vehicles', label: 'My Vehicles', icon: '🚗' },
    { path: '/entry-exit', label: 'Entry/Exit', icon: '🚪' },
    { path: '/reservation-history', label: 'History', icon: '📋' },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section" onClick={() => navigate('/')}>
          <div className="logo-icon">🅿️</div>
          <div className="logo-content">
            <h1 className="logo-title">GetParked</h1>
            <p className="logo-subtitle">Smart Parking Solution</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <nav className="desktop-nav">
            <div className="nav-items">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* User Section */}
        {user && (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>

            <div className="user-actions">
              {user.role === 'admin' && (
                <button onClick={handleToggleView} className="action-btn admin-btn">
                  <span className="btn-icon">⚙️</span>
                  <span className="btn-label">
                    {window.location.pathname === '/admin' ? 'User View' : 'Admin View'}
                  </span>
                </button>
              )}
              <button onClick={onLogout} className="action-btn logout-btn">
                <span className="btn-icon">⏻</span>
                <span className="btn-label">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-items">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`mobile-nav-item ${isActivePath(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}

            <div className="mobile-actions">
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    handleToggleView();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mobile-action-btn admin-btn"
                >
                  <span className="btn-icon">⚙️</span>
                  <span className="btn-label">
                    {window.location.pathname === '/admin' ? 'User View' : 'Admin View'}
                  </span>
                </button>
              )}
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-action-btn logout-btn"
              >
                <span className="btn-icon">⏻</span>
                <span className="btn-label">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
