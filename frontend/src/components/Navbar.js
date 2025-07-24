import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import ProfileDropdown from './ProfileDropdown';

const Navbar = ({ user, onLogout, onChangePassword }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initials = user && user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/">PCA Travels</Link>
      </div>
      <div className={`navbar__links${mobileMenuOpen ? ' open' : ''}`}>
        {!user && <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>}
        {!user && <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>}
        {user && <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>{user.is_admin ? 'My Trips' : 'My Bookings'}</Link>}
        <Link to="/tours" onClick={() => setMobileMenuOpen(false)}>Tours</Link>
        <Link to="/destinations" onClick={() => setMobileMenuOpen(false)}>Destinations</Link>
        <Link to="/vehicles" onClick={() => setMobileMenuOpen(false)}>Vehicles</Link>
      </div>
      <div className="navbar__hamburger" onClick={() => setMobileMenuOpen(v => !v)}>
        {/* Hamburger menu for mobile (to be implemented) */}
        <span>☰</span>
      </div>
      {mobileMenuOpen && <div className="navbar__backdrop" onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />}
      {user && (
        <div className="navbar__profile" style={{ position: 'relative', marginLeft: 24 }}>
          <div
            className="navbar__avatar"
            onClick={() => setProfileOpen(v => !v)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#ff5e5b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
            title="Profile"
          >
            {initials}
          </div>
          {profileOpen && (
            <ProfileDropdown
              user={user}
              onLogout={onLogout}
              onChangePassword={onChangePassword}
              onClose={() => setProfileOpen(false)}
            />
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 