import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage'; // NEW
import Header from './components/Header';

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

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex flex-col items-center">
      <Header user={user} setView={setView} onLogout={handleLogout} />
      <main className="w-full max-w-3xl flex flex-col items-center justify-center p-4 md:p-8 text-center">
        {!user ? (
          <AuthPage onLogin={handleLogin} />
        ) : view === 'admin' && user.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <HomePage />
        )}
      </main>
    </div>
  );
}

export default App;