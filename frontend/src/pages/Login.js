import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { validateEmail } from '../utils/validation';

const styles = `
  .auth-container { max-width:500px; margin:80px auto 40px; padding:30px; background:#fff; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.08); font-family:Arial,sans-serif }
  .auth-title { text-align:center; margin-bottom:24px; font-size:26px; color:#333; font-weight:700 }
  .form-group { margin-bottom:18px }
  .form-group label { display:block; margin-bottom:8px; font-weight:600; color:#333; font-size:14px }
  .form-group input { width:100%; padding:11px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif }
  .form-group input:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .error-message { color:#e74c3c; font-size:13px; margin-top:6px; font-weight:500 }
  .submit-btn { width:100%; padding:12px; background:#3498db; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; margin-top:8px }
  .submit-btn:hover { opacity:0.95; background:#2980b9 }
  .submit-btn:disabled { background:#95a5a6; cursor:not-allowed }
  .auth-link { text-align:center; margin-top:18px; color:#666; font-size:14px }
  .auth-link a { color:#3498db; text-decoration:none }
  .auth-link a:hover { text-decoration:underline }
  .server-error { background:#fee; color:#c0392b; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #c0392b }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      login(response.data.user, response.data.token);
      
      // Route to appropriate dashboard
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.user.role === 'normal_user') {
        navigate('/user/stores');
      } else if (response.data.user.role === 'store_owner') {
        navigate('/store-owner/dashboard');
      }
    } catch (error) {
      setServerError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-container">
        <h1 className="auth-title">Login</h1>
        {serverError && <div className="server-error">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </>
  );
};

export default Login;
