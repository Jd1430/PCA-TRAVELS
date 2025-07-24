import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';

const ProfileDropdown = ({ user, onLogout, onChangePassword, onClose }) => {
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="profile-dropdown" ref={ref}>
      <div className="profile-avatar" style={{ cursor: 'pointer' }} onClick={() => { navigate('/my-details'); onClose(); }}>{initials}</div>
      <div className="profile-info" style={{ cursor: 'pointer' }} onClick={() => { navigate('/my-details'); onClose(); }}>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
        {user.phone && <div className="profile-phone">{user.phone}</div>}
      </div>
      <div className="profile-actions">
        <button onClick={() => { navigate('/change-password'); onClose(); }}>Change Password</button>
        {user.is_admin && <button onClick={() => { navigate('/admin'); onClose(); }}>Admin Dashboard</button>}
        <button onClick={() => { onLogout(); navigate('/'); onClose(); }} className="logout">Logout</button>
      </div>
    </div>
  );
};

export default ProfileDropdown; 