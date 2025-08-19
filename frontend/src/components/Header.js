import React from 'react';
import { useNavigate } from 'react-router-dom';


const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const handleToggleView = () => {
    if (!user || user.role !== 'admin') return;
    // Assuming current path is either '/' (home) or '/admin'
    if (window.location.pathname === '/admin') {
      navigate('/'); // Go to home view
    } else {
      navigate('/admin'); // Go to admin view
    }
  };

  return (
    <header className="bg-white shadow-md py-4 px-4 flex items-center justify-between w-full">
      {/* Left spacer for alignment */}
      <div className="flex-1"></div>

      {/* Centered Logo and Tagline */}
      <div className="flex flex-col items-center flex-grow">
        <h1
          className="text-4xl font-extrabold text-blue-600 cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          GetParked
        </h1>
        <div className="text-lg text-gray-700 font-bold tracking-wide uppercase mt-1">
          A SMART WAY TO PARK
        </div>
      </div>

      {/* Right-aligned User Info and Logout */}
      <div className="flex-1 flex flex-col items-end">
        {user ? (
          <>
            <span className="mb-1 font-medium text-gray-700">Welcome, {user.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="slot-modal-btn disabled"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  width: 'auto',
                  background: 'transparent',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                  e.target.style.color = '#1e293b';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/vehicles')}
                className="slot-modal-btn disabled"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  width: 'auto',
                  background: 'transparent',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                  e.target.style.color = '#1e293b';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                My Vehicles
              </button>
              <button
                onClick={() => navigate('/entry-exit')}
                className="slot-modal-btn disabled"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  width: 'auto',
                  background: 'transparent',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                  e.target.style.color = '#1e293b';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Entry/Exit
              </button>
              <button
                onClick={() => navigate('/reservation-history')}
                className="slot-modal-btn disabled"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  width: 'auto',
                  background: 'transparent',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                  e.target.style.color = '#1e293b';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#374151';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Reservation History
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={handleToggleView}
                  className="slot-modal-btn primary"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    width: 'auto'
                  }}
                >
                  {window.location.pathname === '/admin' ? 'User View' : 'Admin View'}
                </button>
              )}
              <button
                onClick={onLogout}
                className="slot-modal-btn danger"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  width: 'auto'
                }}
              >
                Logout
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
