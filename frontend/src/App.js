import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getVehiclesByOwner } from './services/api';
import VehicleRegistrationPrompt from './components/VehicleRegistrationPrompt';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage'; // NEW
import AdminVehicleViewPage from './pages/AdminVehicleViewPage';
import AdminSlotManagementPage from './pages/AdminSlotManagementPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminPaymentHistory from './pages/AdminPaymentHistory';
import AdminReservationManagement from './pages/AdminReservationManagement';
import VehiclePage from './pages/VehiclePage';
import Header from './components/Header';

import EntryExitPage from './pages/EntryExitPage';
import ReservationHistoryPage from './pages/ReservationHistoryPage';
import PaymentPage from './pages/PaymentPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminFeedback from './pages/AdminFeedback';

import './styles/custom-slotmodal.css';
import './styles/custom-vehicleformmodal.css';
import './styles/custom-styles.css';



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
        <main className="w-full p-4 md:p-8">
          <Routes>
            <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
            <Route path="/reset-password/:token" element={user ? <Navigate to="/" /> : <ResetPassword />} />
            <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
            <Route path="/admin/vehicles" element={user && user.role === 'admin' ? <AdminVehicleViewPage /> : <Navigate to="/" />} />
            <Route path="/admin/manage-slots" element={user && user.role === 'admin' ? <AdminSlotManagementPage /> : <Navigate to="/" />} />
            <Route path="/admin/manage-users" element={user && user.role === 'admin' ? <AdminUserManagementPage onLogout={handleLogout} /> : <Navigate to="/" />} />
            <Route path="/admin/payment-history" element={user && user.role === 'admin' ? <AdminPaymentHistory /> : <Navigate to="/" />} />
            <Route path="/admin/manage-reservations" element={user && user.role === 'admin' ? <AdminReservationManagement /> : <Navigate to="/" />} />
            <Route path="/admin/feedback" element={user && user.role === 'admin' ? <AdminFeedback /> : <Navigate to="/" />} />
            <Route path="/vehicles" element={user ? <VehiclePage /> : <Navigate to="/auth" />} />
            <Route path="/entry-exit" element={user ? <EntryExitPage /> : <Navigate to="/auth" />} />
            <Route path="/reservation-history" element={user ? <ReservationHistoryPage /> : <Navigate to="/auth" />} />
            <Route path="/payment/:id" element={user ? <PaymentPage /> : <Navigate to="/auth" />} />
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