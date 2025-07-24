import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vehiclesAPI } from '../api/vehicles';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './VehicleListCalendar.css';

const MyBookingsPage = ({ user }) => {
  const navigate = useNavigate();
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleType, setRescheduleType] = useState('single');
  const [newFromDate, setNewFromDate] = useState('');
  const [newToDate, setNewToDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchVehicleBookings();
  }, [navigate]);

  const fetchVehicleBookings = async () => {
    setLoading(true);
    try {
      const vres = await vehiclesAPI.getAllVehicleBookings();
      setVehicleBookings(vres.data.bookings || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load bookings. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this vehicle booking?')) {
      return;
    }
    try {
      await vehiclesAPI.updateVehicleBookingStatus(bookingId, 'cancelled');
      fetchVehicleBookings();
      toast.success('Vehicle booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleRescheduleBooking = (booking) => {
    setRescheduleId(booking.id);
    setRescheduleType(booking.from_date === booking.to_date ? 'single' : 'multi');
    setNewFromDate(booking.from_date || '');
    setNewToDate(booking.to_date || booking.from_date || '');
    setNewTime(booking.time || '');
  };

  const handleRescheduleTypeChange = (type) => {
    setRescheduleType(type);
    if (type === 'single') {
      setNewToDate(newFromDate); // Set to_date to from_date
    } else {
      setNewTime(''); // Clear time for multi-day
    }
  };

  const handleRescheduleSubmit = async (bookingId) => {
    if (rescheduleType === 'single') {
      if (!newFromDate || !newTime) {
        toast.error('Please select a date and time');
        return;
      }
    } else {
      if (!newFromDate || !newToDate) {
        toast.error('Please select both From and To dates');
        return;
      }
      if (new Date(newFromDate) > new Date(newToDate)) {
        toast.error('From date cannot be after To date');
        return;
      }
    }
    try {
      const patch = {
        from_date: newFromDate,
        to_date: rescheduleType === 'single' ? newFromDate : newToDate,
        time: rescheduleType === 'single' ? newTime : null,
        status: 'pending'
      };
      await vehiclesAPI.updateVehicleBooking(bookingId, patch);
      toast.success('Booking rescheduled. Please wait for approval.');
      setRescheduleId(null);
      fetchVehicleBookings();
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      toast.error(err.response?.data?.message || 'Failed to reschedule booking');
    }
  };

  const filteredBookings = vehicleBookings.filter(booking => {
    // Use from_date for filtering
    const bookingDate = new Date(booking.from_date);
    const today = new Date();
    switch (filter) {
      case 'upcoming':
        return bookingDate > today && booking.status !== 'cancelled' && booking.status !== 'rejected';
      case 'past':
        return bookingDate < today && booking.status !== 'cancelled' && booking.status !== 'rejected';
      case 'cancelled':
        return booking.status === 'cancelled' || booking.status === 'rejected';
      default:
        return true;
    }
  });
  // Sort by from_date ascending (earliest first)
  filteredBookings.sort((a, b) => new Date(a.from_date) - new Date(b.from_date));

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
        Loading your vehicle bookings...
      </div>
    );
  }

  // Helper to get all dates in a range (inclusive, local time, no UTC)
  function getDatesInRange(start, end) {
    const dates = [];
    let current = new Date(start);
    let last = new Date(end);
    current.setHours(0,0,0,0);
    last.setHours(0,0,0,0);
    while (current <= last) {
      const dStr = [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, '0'),
        String(current.getDate()).padStart(2, '0')
      ].join('-');
      dates.push(dStr);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // Helper to get booked/pending dates for a vehicle (excluding the current booking being rescheduled)
  function getBookedDatesForVehicle(bookings, vehicleId, excludeBookingId) {
    let dates = [];
    bookings.forEach(b => {
      if (b.vehicle.id === vehicleId && b.status === 'approved' && b.id !== excludeBookingId) {
        if (b.from_date && b.to_date) {
          dates = dates.concat(getDatesInRange(b.from_date, b.to_date));
        }
      }
    });
    return dates;
  }
  function getPendingDatesForVehicle(bookings, vehicleId, excludeBookingId) {
    let dates = [];
    bookings.forEach(b => {
      if (b.vehicle.id === vehicleId && b.status === 'pending' && b.id !== excludeBookingId) {
        if (b.from_date && b.to_date) {
          dates = dates.concat(getDatesInRange(b.from_date, b.to_date));
        }
      }
    });
    return dates;
  }
  function getAvailableDatesForVehicle(bookings, vehicleId, excludeBookingId) {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dStr = d.toISOString().slice(0, 10);
      if (
        !getBookedDatesForVehicle(bookings, vehicleId, excludeBookingId).includes(dStr) &&
        !getPendingDatesForVehicle(bookings, vehicleId, excludeBookingId).includes(dStr)
      ) {
        days.push(dStr);
      }
    }
    return days;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>{user?.is_admin ? 'My Trips' : 'My Vehicle Bookings'}</h1>
      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {['all', 'upcoming', 'past', 'cancelled'].map(filterOption => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === filterOption ? '#ff6b6b' : '#f8f9fa',
              color: filter === filterOption ? 'white' : '#666',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {filterOption}
          </button>
        ))}
      </div>
      {error && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      {filteredBookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          color: '#666'
        }}>
          No vehicle bookings found.
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => navigate('/vehicles')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Browse Vehicles
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
          {filteredBookings.map(booking => {
            const isSingleDay = booking.from_date === booking.to_date;
            return (
              <div key={booking.id} style={{
                background: '#fff',
                borderRadius: 20,
                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                padding: window.innerWidth <= 768 ? 14 : 28,
                marginBottom: 0,
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                alignItems: window.innerWidth <= 768 ? 'stretch' : 'center',
                gap: window.innerWidth <= 768 ? 14 : 24,
                minWidth: 0,
                width: '100%',
                maxWidth: 1400,
                boxSizing: 'border-box',
                minHeight: 120
              }}>
                {/* Vehicle image (optional, if available) */}
                {booking.vehicle?.image_url && (
                  <div style={{ minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={booking.vehicle.image_url} alt={booking.vehicle.name} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 12, flexShrink: 0, marginRight: 12 }} />
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'stretch' : 'flex-start', gap: window.innerWidth <= 768 ? 10 : 24, flexWrap: 'wrap' }}>
                  {/* Vehicle name, type, and user (admin only) */}
                  <div style={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 20, color: '#222', letterSpacing: 1 }}>{booking.vehicle?.name || 'Vehicle'}</div>
                      <div style={{ color: '#888', fontSize: 14, fontWeight: 500 }}>({isSingleDay ? 'Single Day' : 'Multi Day'})</div>
                    </div>
                    {user?.is_admin && (
                      <div style={{ color: '#444', fontSize: 15, marginTop: 2 }}>
                        <b>User:</b> {booking.user?.name || booking.user?.username || booking.user?.email || 'Unknown'}
                      </div>
                    )}
                  </div>
                  {/* Dates */}
                  <div style={{ minWidth: 140, alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}>
                {isSingleDay ? (
                  <>
                        <div style={{ color: '#555', fontSize: 15 }}><b>Date:</b> {new Date(booking.from_date).toLocaleDateString()}</div>
                        <div style={{ color: '#555', fontSize: 15 }}><b>Time:</b> {booking.time || '-'}</div>
                  </>
                ) : (
                  <>
                        <div style={{ color: '#555', fontSize: 15 }}><b>From:</b> {new Date(booking.from_date).toLocaleDateString()}</div>
                        <div style={{ color: '#555', fontSize: 15 }}><b>To:</b> {new Date(booking.to_date).toLocaleDateString()}</div>
                  </>
                )}
                  </div>
                  {/* From/To place and details */}
                  <div style={{ minWidth: 120, alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#555', fontSize: 15 }}><b>From:</b> {booking.from_place}</div>
                    <div style={{ color: '#555', fontSize: 15 }}><b>To:</b> {booking.to_place}</div>
                  </div>
                  <div style={{ minWidth: 160, alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#555', fontSize: 15 }}><b>Details:</b> {booking.travel_details}</div>
                  </div>
                  {/* Status */}
                  <div style={{ minWidth: 100, alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                    background: booking.status === 'approved' ? '#d4edda' : booking.status === 'pending' ? '#fff3cd' : booking.status === 'cancelled' || booking.status === 'rejected' ? '#f8d7da' : '#e2e3e5',
                    color: booking.status === 'approved' ? '#155724' : booking.status === 'pending' ? '#856404' : booking.status === 'cancelled' || booking.status === 'rejected' ? '#721c24' : '#383d41',
                      fontWeight: 600,
                      fontSize: 15
                }}>{booking.status?.toUpperCase()}</span>
              </div>
                </div>
                {/* Actions to the far right */}
                {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginLeft: 'auto', alignItems: 'center' }}>
                    <button onClick={() => handleCancelBooking(booking.id)} style={{ background: '#ff5e5b', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600 }}>Cancel</button>
                    <button onClick={() => handleRescheduleBooking(booking)} style={{ background: '#6b8eff', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600 }}>Reschedule</button>
                  </div>
                )}
                {/* Reschedule form UI */}
                {rescheduleId === booking.id && (
                  <div style={{
                    marginTop: 24,
                    width: '100%',
                    background: '#f6f8fa',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 18,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                      <label style={{ marginRight: 12 }}>
                        <input type="radio" checked={rescheduleType === 'single'} onChange={() => handleRescheduleTypeChange('single')} /> Single Day
                      </label>
                      <label>
                        <input type="radio" checked={rescheduleType === 'multi'} onChange={() => handleRescheduleTypeChange('multi')} /> Multi Day
                      </label>
                    </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {rescheduleType === 'single' ? (
                      <>
                        <DatePicker
                          selected={newFromDate ? new Date(newFromDate) : null}
                          onChange={date => { setNewFromDate(date ? date.toISOString().slice(0, 10) : ''); setNewToDate(date ? date.toISOString().slice(0, 10) : ''); }}
                          minDate={new Date()}
                          placeholderText="Select date"
                          dateFormat="yyyy-MM-dd"
                          dayClassName={date => {
                            const dStr = date.toISOString().slice(0, 10);
                            const booked = getBookedDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            const pending = getPendingDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            const available = getAvailableDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            if (booked.includes(dStr)) return 'booked-date';
                            if (pending.includes(dStr)) return 'pending-date';
                            if (available.includes(dStr)) return 'available-date';
                            return undefined;
                          }}
                            customInput={<input style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', width: 140 }} />}
                        />
                        <input
                          type="time"
                          value={newTime}
                          onChange={e => setNewTime(e.target.value)}
                            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', width: 110 }}
                        />
                      </>
                    ) : (
                      <>
                        <DatePicker
                          selected={newFromDate ? new Date(newFromDate) : null}
                          onChange={date => setNewFromDate(date ? date.toISOString().slice(0, 10) : '')}
                          minDate={new Date()}
                          placeholderText="From date"
                          dateFormat="yyyy-MM-dd"
                          dayClassName={date => {
                            const dStr = date.toISOString().slice(0, 10);
                            const booked = getBookedDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            const pending = getPendingDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            const available = getAvailableDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            if (booked.includes(dStr)) return 'booked-date';
                            if (pending.includes(dStr)) return 'pending-date';
                            if (available.includes(dStr)) return 'available-date';
                            return undefined;
                          }}
                            customInput={<input style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', width: 140 }} />}
                        />
                        <span style={{ margin: '0 8px' }}>to</span>
                        <DatePicker
                          selected={newToDate ? new Date(newToDate) : null}
                          onChange={date => setNewToDate(date ? date.toISOString().slice(0, 10) : '')}
                          minDate={newFromDate ? new Date(newFromDate) : new Date()}
                          placeholderText="To date"
                          dateFormat="yyyy-MM-dd"
                          dayClassName={date => {
                            const dStr = date.toISOString().slice(0, 10);
                            const booked = getBookedDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            const pending = getPendingDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            const available = getAvailableDatesForVehicle(vehicleBookings, booking.vehicle.id, booking.id);
                            if (booked.includes(dStr)) return 'booked-date';
                            if (pending.includes(dStr)) return 'pending-date';
                            if (available.includes(dStr)) return 'available-date';
                            return undefined;
                          }}
                            customInput={<input style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', width: 140 }} />}
                        />
                      </>
                    )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginLeft: 18 }}>
                    <button onClick={() => handleRescheduleSubmit(booking.id)} style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600 }}>Submit</button>
                      <button onClick={() => setRescheduleId(null)} style={{ background: '#ccc', color: '#333', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600 }}>Cancel</button>
                    </div>
                  </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage; 