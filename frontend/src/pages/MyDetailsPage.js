import React, { useEffect, useState } from 'react';
import { getMyDetails } from '../api/auth';
import api from '../api/config';
import { useNavigate, Link } from 'react-router-dom';

const MyDetailsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', avatar: null });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please login.');
      setLoading(false);
      return;
    }

    getMyDetails(token)
      .then((res) => {
        // Handle both possible response structures
        const userData = res.data.user || res.data;
        setUser(userData);
        setEditForm({
          name: userData.name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          avatar: null
        });
        setAvatarPreview(userData.avatar_url || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user details:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load user details. Please try again.');
        }
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading your profile...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <Link to="/login" style={{ 
          color: '#007bff', 
          textDecoration: 'none',
          fontSize: '16px'
        }}>
          Go to Login
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          No user data found.
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '30px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '15px'
      }}>
        <h2 style={{ color: '#333', margin: 0 }}>My Profile</h2>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ marginBottom: 12 }}>
            <img
              src={avatarPreview || '/default-avatar.png'}
              alt="Avatar"
              style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }}
            />
          </div>
          {editing && (
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                setEditForm(f => ({ ...f, avatar: file }));
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => setAvatarPreview(ev.target.result);
                  reader.readAsDataURL(file);
                }
              }}
              style={{ marginBottom: 10 }}
            />
          )}
        </div>
        {editing ? (
          <form onSubmit={async e => {
            e.preventDefault();
            setSaving(true);
            try {
              let avatarUrl = avatarPreview;
              if (editForm.avatar) {
                // Simulate upload: in real app, upload to server or cloud storage
                // Here, just use the preview as the avatar URL
                avatarUrl = avatarPreview;
              }
              await api.put('/auth/me', {
                name: editForm.name,
                phone: editForm.phone,
                address: editForm.address,
                avatar_url: avatarUrl
              });
              setUser({ ...user, ...editForm, avatar_url: avatarUrl });
              setEditing(false);
            } catch (err) {
              alert('Failed to update profile');
            } finally {
              setSaving(false);
            }
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333', background: '#f8f9fa' }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333', background: '#f8f9fa' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Address</label>
              <input
                type="text"
                value={editForm.address}
                onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333', background: '#f8f9fa' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setEditing(false)} style={{ padding: '10px 24px', background: '#ccc', color: '#333', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Full Name</label>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333' }}>{user.name}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Email Address</label>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333' }}>{user.email}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Phone</label>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333' }}>{user.phone || '-'}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Address</label>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333' }}>{user.address || '-'}</div>
            </div>
            {user.created_at && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '5px', fontSize: '14px' }}>Member Since</label>
                <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '16px', color: '#333' }}>{new Date(user.created_at).toLocaleDateString()}</div>
              </div>
            )}
            <button onClick={() => setEditing(true)} style={{ padding: '10px 24px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 15, marginTop: 8 }}>Edit</button>
          </>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
         <Link to="/" style={{
           padding: '12px 24px',
           backgroundColor: '#6c757d',
           color: 'white',
           textDecoration: 'none',
           borderRadius: '4px',
           fontSize: '14px',
           transition: 'background-color 0.3s'
         }}>
           Back to Home
         </Link>
       </div>
     </div>
   );
};

export default MyDetailsPage;
