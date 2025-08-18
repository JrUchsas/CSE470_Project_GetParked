import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage'; // NEW
import Header from './components/Header';
import VehiclePage from './pages/VehiclePage';
import EntryExitPage from './pages/EntryExitPage';
import ReservationHistoryPage from './pages/ReservationHistoryPage';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');

  // Check for user in localStorage on initial load
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setView('home'); // Reset view to home on logout
  };

  const renderView = () => {
    if (!user) {
      return <AuthPage onLogin={handleLogin} />;
    }

    switch (view) {
      case 'admin':
        return user.role === 'admin' ? <AdminDashboard /> : <HomePage user={user} />;
      case 'vehicles':
        return <VehiclePage />;
      case 'entry-exit':
        return <EntryExitPage />;
      case 'reservation-history':
        return <ReservationHistoryPage />;
      case 'home':
      default:
        return <HomePage user={user} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
      
      <Header user={user} setView={setView} onLogout={handleLogout} view={view} />
      <main className="w-full max-w-3xl flex flex-col items-center justify-center p-4 md:p-8 text-center">
        {renderView()}
      </main>
    </div>
  );
}

export default App;