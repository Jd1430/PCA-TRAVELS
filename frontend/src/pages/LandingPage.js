import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toursAPI } from '../api/tours';
import { destinationsAPI } from '../api/destinations';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredTours, setFeaturedTours] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toursRes, destinationsRes] = await Promise.all([
          toursAPI.getAllTours(),
          destinationsAPI.getAllDestinations()
        ]);

        // Get featured tours (e.g., first 3 tours)
        setFeaturedTours(toursRes.data.tours.slice(0, 3));
        
        // Get popular destinations (e.g., first 4 destinations)
        setPopularDestinations(destinationsRes.data.destinations.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const HeroSection = () => (
    <div style={{ 
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://source.unsplash.com/1600x900/?travel,landscape")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ 
        fontSize: '3.5rem',
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        Welcome to Poorna Chandra Agastya Travels
      </h1>
      <p style={{ 
        fontSize: '1.5rem',
        marginBottom: '30px',
        maxWidth: '800px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
      }}>
        Discover amazing destinations and create unforgettable memories with our expertly curated tours
      </p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={() => navigate('/tours')}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Explore Tours
        </button>
        <button
          onClick={() => navigate('/destinations')}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid white',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#333';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'white';
          }}
        >
          View Destinations
        </button>
      </div>
    </div>
  );

  const FeaturedTours = () => (
    <div style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>Featured Tours</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {featuredTours.map(tour => (
          <div key={tour.id} style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          onClick={() => navigate(`/tours/${tour.id}`)}
          >
            <img
              src={tour.image_url || 'https://source.unsplash.com/300x200/?travel'}
              alt={tour.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '10px', color: '#333' }}>{tour.name}</h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                {tour.description.substring(0, 100)}...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  ${tour.price}
                </span>
                <span style={{ color: '#666' }}>
                  {tour.duration_days} days
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PopularDestinations = () => (
    <div style={{ padding: '60px 20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>Popular Destinations</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {popularDestinations.map(dest => (
          <div key={dest.id} style={{
            position: 'relative',
            height: '300px',
            borderRadius: '10px',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={() => navigate(`/destinations/${dest.id}`)}
          >
            <img
              src={dest.image_url || `https://source.unsplash.com/400x300/?${dest.name},travel`}
              alt={dest.name}
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
              padding: '20px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '5px' }}>{dest.name}</h3>
              <p>{dest.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
        Loading...
      </div>
    );
  }

  return (
    <div>
      <HeroSection />
      <FeaturedTours />
      <PopularDestinations />
      
      <div style={{
        backgroundColor: '#ff6b6b',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Ready to Start Your Journey?</h2>
        <p style={{ marginBottom: '30px', maxWidth: '600px', margin: '0 auto' }}>
          Join us today and explore the world's most amazing destinations
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: 'white',
            color: '#ff6b6b',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Sign Up Now
        </button>
      </div>
    </div>
  );
};

export default LandingPage; 