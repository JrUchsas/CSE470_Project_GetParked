import React from 'react';


const Header = ({ user, setView, onLogout }) => {
  // Determine current view from location or props if needed
  // We'll use window.location.hash or similar if needed, but for now, rely on setView logic
  const [currentView, setCurrentView] = React.useState('home');

  React.useEffect(() => {
    // Listen for view changes if needed
    // For now, just a placeholder if you want to sync with parent
  }, []);

  const handleToggleView = () => {
    if (!user || user.role !== 'admin') return;
    setView((prev) => (prev === 'admin' ? 'home' : 'admin'));
    setCurrentView((prev) => (prev === 'admin' ? 'home' : 'admin'));
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-center min-h-[64px] text-center relative">
        {/* Left column: invisible, matches right width for centering */}
        <div className="flex-1 invisible"></div>
        {/* Center column: logo */}
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-2xl font-bold text-blue-600 cursor-pointer select-none" onClick={() => setView('home')}>GetParked</h1>
        </div>
        {/* Right column: user info/buttons */}
        <div className="flex-1 flex flex-col justify-center items-center h-full z-20 text-center">
          {user ? (
            <>
              <span className="mb-1 font-medium text-gray-700">Welcome, {user.name}</span>
              <div>
                {user.role === 'admin' && (
                  <button
                    onClick={handleToggleView}
                    className="text-gray-700 hover:text-blue-600 font-medium mr-4"
                  >
                    {window.location.pathname.includes('admin') || currentView === 'admin' ? 'User' : 'Admin'}
                  </button>
                )}
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                  Logout
                </button>
              </div>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
};

export default Header;