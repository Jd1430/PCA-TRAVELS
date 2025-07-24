import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDashboardTabs from '../components/AdminDashboardTabs';
import '../components/AdminDashboardTabs.css';
import VehicleManagement from '../components/VehicleManagement';
import BookingApproval from '../components/BookingApproval';
import UserList from '../components/UserList';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [bookingsRes, destinationsRes, toursRes] = await Promise.all([
        axios.get('/api/admin/bookings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/destinations'),
        axios.get('/api/tours')
      ]);

      setBookings(bookingsRes.data.bookings);
      setDestinations(destinationsRes.data.destinations);
      setTours(toursRes.data.tours);

      // Calculate stats
      const totalRevenue = bookingsRes.data.bookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + b.total_price, 0);

      setStats({
        totalBookings: bookingsRes.data.bookings.length,
        totalRevenue,
        totalDestinations: destinationsRes.data.destinations.length,
        totalTours: toursRes.data.tours.length,
        pendingBookings: bookingsRes.data.bookings.filter(b => b.booking_status === 'pending').length
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load admin dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/bookings/${bookingId}`, 
        { booking_status: status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status');
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) {
      return;
    }

    try {
      await axios.delete(`/api/tours/${tourId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error deleting tour:', err);
      alert('Failed to delete tour');
    }
  };

  const handleDeleteDestination = async (destinationId) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) {
      return;
    }

    try {
      await axios.delete(`/api/destinations/${destinationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error deleting destination:', err);
      alert('Failed to delete destination');
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>Admin Dashboard</h1>
      <AdminDashboardTabs>
        <div label="Vehicle Management">
          <VehicleManagement />
        </div>
        <div label="Booking Approval">
          <BookingApproval />
        </div>
        <div label="User Database">
          <UserList />
        </div>
      </AdminDashboardTabs>
    </div>
  );
};

export default AdminDashboardPage; 