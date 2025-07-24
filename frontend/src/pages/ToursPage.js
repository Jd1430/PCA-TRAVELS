import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toursAPI } from '../api/tours';

const ToursPage = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    destination: '',
    minPrice: '',
    maxPrice: '',
    duration: ''
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await toursAPI.getAllTours();
      setTours(response.data.tours);
      setError(null);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Failed to load tours. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredTours = tours.filter(tour => {
    if (filters.destination && !tour.destination.name.toLowerCase().includes(filters.destination.toLowerCase())) {
      return false;
    }
    if (filters.minPrice && tour.price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && tour.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    if (filters.duration && tour.duration_days !== parseInt(filters.duration)) {
      return false;
    }
    return true;
  });

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
        Loading tours...
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

  return (
    <div style={{ padding: '20px' }}>
      {/* Filters Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Find Your Perfect Tour</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <input
            type="text"
            name="destination"
            placeholder="Destination"
            value={filters.destination}
            onChange={handleFilterChange}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (days)"
            value={filters.duration}
            onChange={handleFilterChange}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          />
        </div>
      </div>

      {/* Tours Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px',
        padding: '20px 0'
      }}>
        {filteredTours.map(tour => (
          <div
            key={tour.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/tours/${tour.id}`)}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <img
              src={tour.image_url || `https://source.unsplash.com/300x200/?${tour.destination.name},travel`}
              alt={tour.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '10px', color: '#333' }}>{tour.name}</h3>
              <p style={{ color: '#666', marginBottom: '15px', fontSize: '0.9rem' }}>
                {tour.description.substring(0, 100)}...
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
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
                <span>📍 {tour.destination.name}</span>
                <span>
                  {tour.available_dates.length} dates available
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTours.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          No tours found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default ToursPage; 