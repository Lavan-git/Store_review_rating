import React, { useState } from 'react';
import { adminService } from '../services/api';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validation';

const styles = `
  .form-container { max-width:650px; margin:40px auto; padding:30px; background:#fff; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.08); font-family:Arial,sans-serif }
  .form-title { font-size:26px; color:#333; margin-bottom:24px; font-weight:700 }
  .form-group { margin-bottom:18px }
  .form-group label { display:block; margin-bottom:8px; font-weight:600; color:#333; font-size:14px }
  .form-group input, .form-group textarea, .form-group select { width:100%; padding:11px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .form-group textarea { resize:vertical; min-height:100px }
  .error-message { color:#e74c3c; font-size:13px; margin-top:6px; font-weight:500 }
  .submit-btn { width:100%; padding:12px; background:#27ae60; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer }
  .submit-btn:hover { opacity:0.95; background:#229954 }
  .submit-btn:disabled { background:#95a5a6; cursor:not-allowed }
  .server-error { background:#fee; color:#c0392b; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #c0392b }
  .success-message { background:#e8f8f0; color:#27ae60; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #27ae60 }
  .password-hint { font-size:12px; color:#888; margin-top:6px }
`;

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'normal_user'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || !validateName(formData.name)) {
      newErrors.name = 'Name must be between 20 and 60 characters';
    }
    
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.address || !validateAddress(formData.address)) {
      newErrors.address = 'Address must not exceed 400 characters';
    }
    
    if (!formData.password || !validatePassword(formData.password)) {
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
    setSuccess('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await adminService.addUser(formData);
      setSuccess('User added successfully!');
      setFormData({
        name: '',
        email: '',
        address: '',
        password: '',
        role: 'normal_user'
      });
      setTimeout(() => {
        window.location.href = '/admin/users';
      }, 1500);
    } catch (error) {
      setServerError(error.response?.data?.error || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="form-container">
        <h1 className="form-title">Add New User</h1>
        {serverError && <div className="server-error">{serverError}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name (20-60 characters)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter user's full name"
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
              placeholder="Enter email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label>Address (max 400 characters)</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
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
              placeholder="Enter password"
            />
            <div className="password-hint">
              Must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*)
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="normal_user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding user...' : 'Add User'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddUser;
