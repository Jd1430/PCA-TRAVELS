import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './api/config';

// Import existing pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import new pages
import ToursPage from './pages/ToursPage';
import TourDetailsPage from './pages/TourDetailsPage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailsPage from './pages/DestinationDetailsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import VehicleListPage from './pages/VehicleListPage';
import MyDetailsPage from './pages/MyDetailsPage';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user info on app load if JWT exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Handle login/register: save JWT and user info
  const handleAuthSuccess = (token, user) => {
    localStorage.setItem('token', token);
    setUser(user);
    toast.success('Welcome, ' + user.name + '!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out');
  };

  // Auto-redirect admin to dashboard after login
  useEffect(() => {
    if (user && user.is_admin && window.location.pathname !== '/admin') {
      window.location.pathname = '/admin';
    }
  }, [user]);

  if (loadingUser) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#ff5e5b' }}>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
      <Routes>
          {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/register" element={<RegisterPage onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Tour Routes */}
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:tourId" element={<TourDetailsPage />} />
          
          {/* Destination Routes */}
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:destinationId" element={<DestinationDetailsPage />} />
          
          {/* Vehicle Routes */}
          <Route path="/vehicles" element={<VehicleListPage />} />
          
          {/* Protected Routes */}
          <Route path="/my-details" element={<MyDetailsPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage user={user} />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
        {/* Change Password Modal (to be implemented) */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </Router>
  );
}

export default App;
