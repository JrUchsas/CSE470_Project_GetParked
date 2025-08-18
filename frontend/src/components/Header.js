import React from 'react';


const Header = ({ user, setView, onLogout, view }) => {
  const handleToggleView = () => {
    if (!user || user.role !== 'admin') return;
    setView((prev) => (prev === 'admin' ? 'home' : 'admin'));
  };

  return (
    <header className="bg-white shadow-md py-4 px-4 flex items-center justify-between w-full">
      {/* Left spacer for alignment */}
      <div className="flex-1"></div>

      {/* Centered Logo and Tagline */}
      <div className="flex flex-col items-center flex-grow">
        <h1
          className="text-4xl font-extrabold text-blue-600 cursor-pointer select-none"
          onClick={() => setView('home')}
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
                onClick={() => setView('vehicles')}
                className="text-gray-700 hover:text-blue-600 font-medium mr-4"
              >
                My Vehicles
              </button>
              <button
                onClick={() => setView('entry-exit')}
                className="text-gray-700 hover:text-blue-600 font-medium mr-4"
              >
                Entry/Exit
              </button>
              <button
                onClick={() => setView('reservation-history')}
                className="text-gray-700 hover:text-blue-600 font-medium mr-4"
              >
                Reservation History
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={handleToggleView}
                  className="text-gray-700 hover:text-blue-600 font-medium mr-4"
                >
                  {view === 'admin' ? 'User View' : 'Admin View'}
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
