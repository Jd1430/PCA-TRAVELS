import React, { useState, useEffect } from 'react';
import { vehiclesAPI } from '../api/vehicles';
import { toast } from 'react-toastify';

const BookingApproval = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await vehiclesAPI.getAllVehicleBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await vehiclesAPI.updateVehicleBookingStatus(id, newStatus);
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to update booking');
    }
  };

  if (loading) return <div>Loading vehicle bookings...</div>;

  return (
    <div>
      <h3>Vehicle Booking Requests</h3>
      <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#ffeaea', color: '#ff5e5b' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>User</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Vehicle</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
            <th style={{ padding: 12, textAlign: 'left' }}>From Place</th>
            <th style={{ padding: 12, textAlign: 'left' }}>To Place</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Description</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.filter(b => b.status === 'pending').map(booking => (
            <tr key={booking.id} style={{ borderTop: '1px solid #f3bcbc' }}>
              <td style={{ padding: 12 }}>{booking.user.name}</td>
              <td style={{ padding: 12 }}>{booking.vehicle.name}</td>
              <td style={{ padding: 12 }}>{booking.date}</td>
              <td style={{ padding: 12 }}>{booking.from_place}</td>
              <td style={{ padding: 12 }}>{booking.to_place}</td>
              <td style={{ padding: 12 }}>{booking.travel_details}</td>
              <td style={{ padding: 12 }}>
                <span style={{
                  color: booking.status === 'approved' ? '#28a745' : booking.status === 'rejected' ? '#dc3545' : '#ff5e5b',
                  fontWeight: 600
                }}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
              </td>
              <td style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => handleStatusChange(booking.id, 'approved')} style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, padding: '0.4rem 1.2rem', fontWeight: 500 }}>Approve</button>
                  <button onClick={() => handleStatusChange(booking.id, 'rejected')} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '0.4rem 1.2rem', fontWeight: 500 }}>Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingApproval; 