import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DestinationDetailsPage = () => {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDestinationDetails();
  }, [destinationId]);

  const fetchDestinationDetails = async () => {
    try {
      const response = await axios.get(`/api/destinations/${destinationId}`);
      setDestination(response.data.destination);
      setError(null);
    } catch (err) {
      console.error('Error fetching destination details:', err);
      setError('Failed to load destination details. Please try again later.');
    } finally {
      setLoading(false);
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
        Loading destination details...
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

  if (!destination) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        Destination not found.
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        height: '500px',
        overflow: 'hidden'
      }}>
        <img
          src={destination.image_url || `https://source.unsplash.com/1600x900/?${destination.name},travel`}
          alt={destination.name}
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
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>
              {destination.name}
            </h1>
            <p style={{ fontSize: '1.2rem' }}>
              {destination.city && `${destination.city}, `}
              {destination.state && `${destination.state}, `}
              {destination.country}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Description Section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>About {destination.name}</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1.1rem' }}>
            {destination.description}
          </p>
        </section>

        {/* Available Tours Section */}
        <section>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Available Tours</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {destination.tours.map(tour => (
              <div
                key={tour.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => navigate(`/tours/${tour.id}`)}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <img
                  src={tour.image_url || `https://source.unsplash.com/300x200/?${destination.name},travel`}
                  alt={tour.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ padding: '20px' }}>
                  <h3 style={{ color: '#333', marginBottom: '10px' }}>{tour.name}</h3>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      ${tour.price}
                    </span>
                    <span style={{ color: '#666' }}>
                      {tour.duration_days} days
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    <span>{tour.available_dates_count} dates available</span>
                    <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {destination.tours.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px'
            }}>
              No tours available for this destination at the moment.
            </div>
          )}
        </section>

        {/* Back Button */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/destinations')}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff5252'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b6b'}
          >
            ← Back to All Destinations
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailsPage; 