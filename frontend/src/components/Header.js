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
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600 font-medium mr-4"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/vehicles')}
                className="text-gray-700 hover:text-blue-600 font-medium mr-4"
              >
                My Vehicles
              </button>
              <button
                onClick={() => navigate('/entry-exit')}
                className="text-gray-700 hover:text-blue-600 font-medium mr-4"
              >
                Entry/Exit
              </button>
              <button
                onClick={() => navigate('/reservation-history')}
                className="text-gray-700 hover:text-blue-600 font-medium mr-4"
              >
                Reservation History
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={handleToggleView}
                  className="text-gray-700 hover:text-blue-600 font-medium mr-4"
                >
                  {window.location.pathname === '/admin' ? 'User View' : 'Admin View'}
                </button>
              )}
              <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
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
