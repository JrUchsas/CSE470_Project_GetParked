import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getVehiclesByOwner } from './services/api';
import VehicleRegistrationPrompt from './components/VehicleRegistrationPrompt';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage'; // NEW
import AdminVehicleViewPage from './pages/AdminVehicleViewPage';
import VehiclePage from './pages/VehiclePage';
import Header from './components/Header';

import EntryExitPage from './pages/EntryExitPage';
import ReservationHistoryPage from './pages/ReservationHistoryPage';

import './styles/custom-slotmodal.css';
import './styles/custom-vehicleformmodal.css';



function App() {
  const [user, setUser] = useState(null);
  const [showVehicleRegistrationPrompt, setShowVehicleRegistrationPrompt] = useState(false);
  
  // Check for user in localStorage on initial load
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
      checkUserVehicles(foundUser);
    }
  }, []);

  const checkUserVehicles = async (userData) => {
    if (userData && userData.id) {
      try {
        const vehicles = await getVehiclesByOwner(userData.id);
        if (vehicles.length === 0) {
          setShowVehicleRegistrationPrompt(true);
        } else {
          setShowVehicleRegistrationPrompt(false);
        }
      } catch (error) {
        console.error('Error checking user vehicles:', error);
        // Optionally, handle error by not showing the prompt or showing a generic error
      }
    }
  };

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    checkUserVehicles(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  

  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
        
        <Header user={user} onLogout={handleLogout} />
        <main className="w-full max-w-3xl flex flex-col items-center justify-center p-4 md:p-8 text-center">
          <Routes>
            <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />} />
            <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/admin/vehicles" element={user && user.role === 'admin' ? <AdminVehicleViewPage /> : <Navigate to="/" />} />
            <Route path="/vehicles" element={user ? <VehiclePage /> : <Navigate to="/auth" />} />
            <Route path="/entry-exit" element={user ? <EntryExitPage /> : <Navigate to="/auth" />} />
            <Route path="/reservation-history" element={user ? <ReservationHistoryPage /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/" />} /> {/* Catch-all for unknown routes */}
          </Routes>
        </main>

        {showVehicleRegistrationPrompt && (
          <VehicleRegistrationPrompt
            onClose={() => setShowVehicleRegistrationPrompt(false)}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;