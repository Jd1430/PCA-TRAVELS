import React, { useState } from 'react';
import { changePassword } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ old_password: '', new_password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await changePassword(form);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Change password error:', err);
      let errorMessage = 'Password change failed';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: '4px',
          border: '1px solid #c3e6cb',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ Success!</h3>
          <p style={{ margin: 0 }}>Your password has been changed successfully.</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Change Password</h2>
      
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #ffeaa7',
        marginBottom: '25px'
      }}>
        <p style={{ 
          margin: 0, 
          color: '#856404', 
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          <strong>Security Note:</strong> Make sure to choose a strong password that you haven't used before.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password"
            placeholder="Current Password" 
            value={form.old_password}
            onChange={(e) => setForm({ ...form, old_password: e.target.value })}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="password" 
            placeholder="New Password" 
            value={form.new_password}
            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px', 
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
      
      {error && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
