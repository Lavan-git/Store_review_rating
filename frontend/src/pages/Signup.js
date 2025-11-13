import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { validateEmail, validatePassword, validateName, validateAddress } from '../utils/validation';

const styles = `
  .auth-container { max-width:550px; margin:40px auto; padding:30px; background:#fff; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.08); font-family:Arial,sans-serif }
  .auth-title { text-align:center; margin-bottom:24px; font-size:26px; color:#333; font-weight:700 }
  .form-group { margin-bottom:18px }
  .form-group label { display:block; margin-bottom:8px; font-weight:600; color:#333; font-size:14px }
  .form-group input, .form-group textarea { width:100%; padding:11px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif }
  .form-group input:focus, .form-group textarea:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .form-group textarea { resize:vertical; min-height:100px }
  .error-message { color:#e74c3c; font-size:13px; margin-top:6px; font-weight:500 }
  .submit-btn { width:100%; padding:12px; background:#27ae60; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; margin-top:8px }
  .submit-btn:hover { opacity:0.95; background:#229954 }
  .submit-btn:disabled { background:#95a5a6; cursor:not-allowed }
  .auth-link { text-align:center; margin-top:18px; color:#666; font-size:14px }
  .auth-link a { color:#3498db; text-decoration:none }
  .auth-link a:hover { text-decoration:underline }
  .server-error { background:#fee; color:#c0392b; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #c0392b }
  .password-hint { font-size:12px; color:#888; margin-top:6px }
  /* Role select: match inputs + custom arrow */
.form-group select,
.role-select {
  width: 100%;
  padding: 11px 40px 11px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: Arial, sans-serif;
  background-color: #fff;
  color: #333;
  outline: 0;

  /* remove native look and add custom arrow */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  background-image: url("data:image/svg+xml;utf8,<svg width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M6 9l6 6 6-6' fill='none' stroke='%23777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.form-group select:focus,
.role-select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52,152,219,0.1);
}

/* Disabled state (optional) */
.form-group select:disabled,
.role-select:disabled {
  background-color: #f8f8f8;
  color: #999;
  cursor: not-allowed;
}

`;

const Signup = () => {
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  address: '',
  password: '',
  role: 'normal_user', // NEW
});



  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be between 20 and 60 characters';
    }
    // 2) Validate: add role check
    if (!['normal_user','store_owner'].includes(formData.role)) {
    newErrors.role = 'Please select a valid role';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required';
    } else if (!validateAddress(formData.address)) {
      newErrors.address = 'Address must not exceed 400 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8-16 characters with at least one uppercase letter and one special character';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await authService.signup(formData);
      login(response.data.user, response.data.token);
      navigate('/user/stores');
    } catch (error) {
      setServerError(error.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-container">
        <h1 className="auth-title">Sign Up</h1>
        {serverError && <div className="server-error">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name (20-60 characters)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label>Address (max 400 characters)</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>


          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            <div className="password-hint">
              Must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*)
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

           {/* 3) JSX: add Role select below Password block */}
            <div className="form-group">
            <label>Role</label>
            <select
                name="role"
                value={formData.role}
                onChange={handleChange}
            >
                <option value="normal_user">Normal User</option>
                <option value="store_owner">Store Owner</option>
            </select>
            {errors.role && <div className="error-message">{errors.role}</div>}
            </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </>
  );
};

export default Signup;
