import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TourDetailsPage = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [participants, setParticipants] = useState(1);
  const [isLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    fetchTourDetails();
  }, [tourId]);

  const fetchTourDetails = async () => {
    try {
      const response = await axios.get(`/api/tours/${tourId}`);
      setTour(response.data.tour);
      setError(null);
    } catch (err) {
      console.error('Error fetching tour details:', err);
      setError('Failed to load tour details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      alert('Please select a departure date');
      return;
    }

    try {
      const response = await axios.post('/api/bookings', {
        tour_date_id: selectedDate,
        number_of_participants: participants
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Booking successful!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Failed to create booking');
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
        Loading tour details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#dc3545'
      }}>
        {error}
      </div>
    );
  }

  if (!tour) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        Tour not found.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        height: '400px',
        borderRadius: '15px',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <img
          src={tour.image_url || `https://source.unsplash.com/1200x400/?${tour.destination.name},travel`}
          alt={tour.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '40px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          color: 'white'
        }}>
          <h1 style={{ marginBottom: '10px', fontSize: '2.5rem' }}>{tour.name}</h1>
          <p style={{ fontSize: '1.2rem' }}>
            📍 {tour.destination.name}, {tour.destination.country}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px'
      }}>
        {/* Left Column - Tour Information */}
        <div>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>About This Tour</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>{tour.description}</p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>Included Services</h2>
            <ul style={{ color: '#666', paddingLeft: '20px' }}>
              {tour.included_services.map((service, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>✓ {service}</li>
              ))}
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>Itinerary</h2>
            <div style={{ color: '#666' }}>
              {tour.itinerary.map((day, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#444', marginBottom: '10px' }}>Day {index + 1}</h3>
                  <p style={{ lineHeight: '1.6' }}>{day}</p>
                </div>
              ))}
            </div>
          </section>

          {tour.reviews && tour.reviews.length > 0 && (
            <section>
              <h2 style={{ color: '#333', marginBottom: '15px' }}>Reviews</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                {tour.reviews.map(review => (
                  <div key={review.id} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>
                        {review.user_name}
                      </span>
                      <span style={{ color: '#666' }}>
                        {'⭐'.repeat(review.rating)}
                      </span>
                    </div>
                    <p style={{ color: '#666' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Booking Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Book This Tour</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ color: '#666' }}>Duration:</span>
              <span style={{ color: '#333', fontWeight: 'bold' }}>
                {tour.duration_days} days
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <span style={{ color: '#666' }}>Price per person:</span>
              <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '1.2rem' }}>
                ${tour.price}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
              Select Departure Date:
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                marginBottom: '15px'
              }}
            >
              <option value="">Choose a date</option>
              {tour.available_dates.map(date => (
                <option key={date.id} value={date.id}>
                  {new Date(date.departure_date).toLocaleDateString()} - 
                  {date.available_seats} seats left - 
                  ${date.price}
                </option>
              ))}
            </select>

            <label style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
              Number of Participants:
            </label>
            <input
              type="number"
              min="1"
              value={participants}
              onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                marginBottom: '20px'
              }}
            />
          </div>

          <button
            onClick={handleBooking}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff5252'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b6b'}
          >
            {isLoggedIn ? 'Book Now' : 'Login to Book'}
          </button>

          {!isLoggedIn && (
            <p style={{
              marginTop: '10px',
              fontSize: '0.9rem',
              color: '#666',
              textAlign: 'center'
            }}>
              Please login or register to book this tour
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourDetailsPage; 