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
    <header>
      <div>
        <h1>
          GetParked
        </h1>
        <div>
          A SMART WAY TO PARK
        </div>
      </div>

      <div>
        {user ? (
          <>
            <span>Welcome, {user.name}</span>
            <div>
              {user.role === 'admin' && (
                <button
                  onClick={handleToggleView}
                >
                  {currentView === 'admin' ? 'User View' : 'Admin View'}
                </button>
              )}
              <button onClick={onLogout}>
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