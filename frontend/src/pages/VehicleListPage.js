import React, { useState, useEffect } from 'react';
import { vehiclesAPI } from '../api/vehicles';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './VehicleListCalendar.css';

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingType, setBookingType] = useState({}); // { [vehicleId]: 'single' | 'multi' }
  const [selected, setSelected] = useState({}); // { [vehicleId]: { from: date, to: date, time: string } }
  const [calendar, setCalendar] = useState({}); // { [vehicleId]: [bookedDates] }
  const [pending, setPending] = useState({}); // { [vehicleId]: [pendingDates] }
  const [fromTo, setFromTo] = useState({}); // { [vehicleId]: { from_place, to_place, description } }

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await vehiclesAPI.getAllVehicles();
        setVehicles(res.data.vehicles || res.data);
        setError(null);
      } catch {
        setError('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Helper to format date as YYYY-MM-DD in local time
  function formatDateLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper to get all dates in a range
  function getDatesInRange(start, end) {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(formatDateLocal(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // Update useEffect for calendar and pending to store full booking objects
  useEffect(() => {
    const fetchCalendars = async () => {
      for (const vehicle of vehicles) {
        try {
          const res = await vehiclesAPI.getAllVehicleBookings();
          // Filter for approved bookings for this vehicle
          const bookings = (res.data.bookings || []).filter(b => b.vehicle.id === vehicle.id && b.status === 'approved');
          setCalendar(prev => ({ ...prev, [vehicle.id]: bookings }));
        } catch {
          setCalendar(prev => ({ ...prev, [vehicle.id]: [] }));
        }
      }
    };
    if (vehicles.length) fetchCalendars();
  }, [vehicles]);

  useEffect(() => {
    // Fetch user's pending bookings for all vehicles
    const fetchPending = async () => {
      try {
        const res = await vehiclesAPI.getAllVehicleBookings();
        const pendingMap = {};
        (res.data.bookings || []).forEach(b => {
          if (b.status === 'pending') {
            if (!pendingMap[b.vehicle.id]) pendingMap[b.vehicle.id] = [];
            pendingMap[b.vehicle.id].push(b);
          }
        });
        setPending(pendingMap);
      } catch {
        setPending({});
      }
    };
    fetchPending();
  }, [vehicles]);

  const handleDateSelect = (vehicleId, date, isBooked, isPending) => {
    if (!isBooked && !isPending) {
      setSelected({ ...selected, [vehicleId]: date });
    }
  };

  const handleFromToChange = (vehicleId, field, value) => {
    setFromTo(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [field]: value
      }
    }));
  };

  const handleBook = async (vehicleId) => {
    const type = bookingType[vehicleId] || 'single';
    const sel = selected[vehicleId] || {};
    const from_place = fromTo[vehicleId]?.from_place || '';
    const to_place = fromTo[vehicleId]?.to_place || '';
    const description = fromTo[vehicleId]?.description || '';
    if (type === 'single') {
      if (!sel.from) return toast.error('Please select a date.');
      if (!sel.time) return toast.error('Please select a time.');
    } else {
      if (!sel.from || !sel.to) return toast.error('Please select both From and To dates.');
      if (new Date(sel.from) > new Date(sel.to)) return toast.error('From date cannot be after To date.');
    }
    if (!from_place || !to_place) {
      toast.error('Please enter both From and To places.');
      return;
    }
    try {
      await vehiclesAPI.requestVehicleBooking({
        vehicle_id: vehicleId,
        from_date: sel.from,
        to_date: type === 'multi' ? sel.to : sel.from,
        time: type === 'single' ? sel.time : undefined,
        from_place,
        to_place,
        travel_details: description
      });
      toast.success('Booking request sent!');
      setSelected({ ...selected, [vehicleId]: {} });
      setFromTo({ ...fromTo, [vehicleId]: { from_place: '', to_place: '', description: '' } });
      // Refresh calendar and pending (optional, not shown for brevity)
    } catch {
      toast.error('Failed to send booking request');
    }
  };

  // Helper to get booked and pending dates for a vehicle
  const getBookedDates = (vehicleId) => {
    const bookings = calendar[vehicleId] || [];
    let dates = [];
    bookings.forEach(b => {
      if (b.from_date && b.to_date) {
        dates = dates.concat(getDatesInRange(b.from_date, b.to_date));
      }
    });
    return dates;
  };
  const getPendingDates = (vehicleId) => {
    const bookings = pending[vehicleId] || [];
    let dates = [];
    bookings.forEach(b => {
      if (b.from_date && b.to_date) {
        dates = dates.concat(getDatesInRange(b.from_date, b.to_date));
      }
    });
    return dates;
  };
  const getAvailableDates = (vehicleId) => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dStr = formatDateLocal(d);
      if (!getBookedDates(vehicleId).includes(dStr) && !getPendingDates(vehicleId).includes(dStr)) {
        days.push(dStr);
      }
    }
    return days;
  };

  if (loading) return <div>Loading vehicles...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100%', minHeight: '80vh', background: '#fafbfc' }}>
      <h2 style={{ textAlign: 'center', margin: '32px 0 36px 0', fontWeight: 700 }}>Available Vehicles</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100, padding: '0 16px' }}>
        {vehicles.map(vehicle => {
          const type = bookingType[vehicle.id] || 'single';
          const sel = selected[vehicle.id] || {};
          return (
            <div key={vehicle.id} style={{
              display: 'flex',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              alignItems: window.innerWidth <= 768 ? 'stretch' : 'center',
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
              padding: window.innerWidth <= 768 ? 14 : 28,
              marginBottom: 28,
              gap: window.innerWidth <= 768 ? 16 : 10,
              width: '100%',
              maxWidth: 1400,
              boxSizing: 'border-box',
              minWidth: 0
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180 }}>
                <img src={vehicle.image_url} alt={vehicle.name} style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 12, flexShrink: 0, marginRight: 24 }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700, fontSize: 24, color: '#222', letterSpacing: 1, textAlign: 'left' }}>{vehicle.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ marginRight: 8 }}>
                      <input
                        type="radio"
                        checked={type === 'single'}
                        onChange={() => setBookingType(prev => ({ ...prev, [vehicle.id]: 'single' }))}
                      /> Single Day
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={type === 'multi'}
                        onChange={() => setBookingType(prev => ({ ...prev, [vehicle.id]: 'multi' }))}
                      /> Multiple Days
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Date/time pickers */}
                  {type === 'single' ? (
                    <>
                      <DatePicker
                        selected={sel.from ? new Date(sel.from) : null}
                        onChange={date => setSelected(prev => ({ ...prev, [vehicle.id]: { ...prev[vehicle.id], from: date ? formatDateLocal(date) : undefined } }))}
                        minDate={new Date()}
                        placeholderText="Select date"
                        dateFormat="yyyy-MM-dd"
                        dayClassName={date => {
                          const dStr = formatDateLocal(date);
                          if (getBookedDates(vehicle.id).includes(dStr)) return 'booked-date';
                          if (getPendingDates(vehicle.id).includes(dStr)) return 'pending-date';
                          if (getAvailableDates(vehicle.id).includes(dStr)) return 'available-date';
                          return undefined;
                        }}
                        customInput={<input style={{ padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 120, fontSize: 15, height: 36, boxSizing: 'border-box' }} />}
                      />
                      <input
                        type="time"
                        value={sel.time || ''}
                        onChange={e => setSelected(prev => ({ ...prev, [vehicle.id]: { ...prev[vehicle.id], time: e.target.value } }))}
                        style={{ padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 110, fontSize: 15, height: 36, boxSizing: 'border-box' }}
                        placeholder="Time"
                      />
                    </>
                  ) : (
                    <>
                      <DatePicker
                        selected={sel.from ? new Date(sel.from) : null}
                        onChange={date => setSelected(prev => ({ ...prev, [vehicle.id]: { ...prev[vehicle.id], from: date ? formatDateLocal(date) : undefined } }))}
                        minDate={new Date()}
                        placeholderText="From date"
                        dateFormat="yyyy-MM-dd"
                        dayClassName={date => {
                          const dStr = formatDateLocal(date);
                          if (getBookedDates(vehicle.id).includes(dStr)) return 'booked-date';
                          if (getPendingDates(vehicle.id).includes(dStr)) return 'pending-date';
                          if (getAvailableDates(vehicle.id).includes(dStr)) return 'available-date';
                          return undefined;
                        }}
                        customInput={<input style={{ padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 120, fontSize: 15, height: 36, boxSizing: 'border-box' }} />}
                      />
                      <span style={{ margin: '0 8px' }}>to</span>
                      <DatePicker
                        selected={sel.to ? new Date(sel.to) : null}
                        onChange={date => setSelected(prev => ({ ...prev, [vehicle.id]: { ...prev[vehicle.id], to: date ? formatDateLocal(date) : undefined } }))}
                        minDate={sel.from ? new Date(sel.from) : new Date()}
                        placeholderText="To date"
                        dateFormat="yyyy-MM-dd"
                        dayClassName={date => {
                          const dStr = formatDateLocal(date);
                          if (getBookedDates(vehicle.id).includes(dStr)) return 'booked-date';
                          if (getPendingDates(vehicle.id).includes(dStr)) return 'pending-date';
                          if (getAvailableDates(vehicle.id).includes(dStr)) return 'available-date';
                          return undefined;
                        }}
                        customInput={<input style={{ padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 120, fontSize: 15, height: 36, boxSizing: 'border-box' }} />}
                      />
                    </>
                  )}
                  {/* ... existing from_place, to_place, description, and Book button ... */}
                  <input
                    type="text"
                    placeholder="From Place"
                    value={fromTo[vehicle.id]?.from_place || ''}
                    onChange={e => handleFromToChange(vehicle.id, 'from_place', e.target.value)}
                    style={{ padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 140, fontSize: 15, height: 36, boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    placeholder="To Place"
                    value={fromTo[vehicle.id]?.to_place || ''}
                    onChange={e => handleFromToChange(vehicle.id, 'to_place', e.target.value)}
                    style={{ padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 140, fontSize: 15, height: 36, boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={fromTo[vehicle.id]?.description || ''}
                    onChange={e => handleFromToChange(vehicle.id, 'description', e.target.value)}
                    style={{ padding: '10px', borderRadius: 4, border: '1px solid #ccc', width: 170, fontSize: 15, height: 36, boxSizing: 'border-box' }}
                  />
                  <button
                    onClick={() => handleBook(vehicle.id)}
                    style={{
                      background: '#ff5e5b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '0 24px',
                      fontWeight: 700,
                      fontSize: 17,
                      opacity: (type === 'single' ? (sel.from && sel.time) : (sel.from && sel.to)) ? 1 : 0.5,
                      cursor: (type === 'single' ? (sel.from && sel.time) : (sel.from && sel.to)) ? 'pointer' : 'not-allowed',
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                    disabled={type === 'single' ? !(sel.from && sel.time) : !(sel.from && sel.to)}
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default VehicleListPage; 