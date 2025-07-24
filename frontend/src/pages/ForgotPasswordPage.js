import React, { useState } from 'react';
import { forgetPassword } from '../api/auth';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await forgetPassword({ email });
      setSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      let errorMessage = 'Failed to send OTP';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
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
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ OTP Sent!</h3>
          <p style={{ margin: 0 }}>A password reset OTP has been generated.</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            <strong>Development Mode:</strong> Check the backend console/terminal for the OTP code.
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #ffeaa7',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <p style={{ 
            margin: 0, 
            color: '#856404', 
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            <strong>💡 Tip:</strong> Look for a message like this in your backend terminal:
            <br />
            <code style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '2px 4px', 
              borderRadius: '2px',
              fontSize: '12px'
            }}>
              🔑 OTP CODE: 123456
            </code>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/reset-password" style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Reset Password
          </Link>
          
          <Link to="/login" style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Forgot Password</h2>
      
      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #b3d9ff',
        marginBottom: '25px'
      }}>
        <p style={{ 
          margin: 0, 
          color: '#0056b3', 
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          <strong>Instructions:</strong> Enter your email address and we'll generate a one-time password (OTP) to reset your password.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="email"
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {loading ? 'Generating OTP...' : 'Generate OTP'}
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
      
      <div style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          Login here
        </Link>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
