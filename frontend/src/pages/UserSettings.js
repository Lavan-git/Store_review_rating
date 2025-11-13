import React, { useState } from 'react';
import { authService } from '../services/api';
import { validatePassword } from '../utils/validation';

const styles = `
  .settings-container { max-width:650px; margin:40px auto; padding:30px; background:#fff; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.08); font-family:Arial,sans-serif }
  .settings-title { font-size:26px; color:#333; margin-bottom:24px; font-weight:700 }
  .form-group { margin-bottom:18px }
  .form-group label { display:block; margin-bottom:8px; font-weight:600; color:#333; font-size:14px }
  .form-group input { width:100%; padding:11px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif }
  .form-group input:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .error-message { color:#e74c3c; font-size:13px; margin-top:6px; font-weight:500 }
  .submit-btn { width:100%; padding:12px; background:#27ae60; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer }
  .submit-btn:hover { opacity:0.95; background:#229954 }
  .submit-btn:disabled { background:#95a5a6; cursor:not-allowed }
  .server-error { background:#fee; color:#c0392b; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #c0392b }
  .success-message { background:#e8f8f0; color:#27ae60; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #27ae60 }
  .password-hint { font-size:12px; color:#888; margin-top:6px }
`;

const UserSettings = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(passwords.newPassword)) {
      newErrors.newPassword = 'Password must be 8-16 characters with at least one uppercase letter and one special character';
    }
    
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
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
      await authService.changePassword(passwords.currentPassword, passwords.newPassword);
      setSuccess('Password changed successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setServerError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="settings-container">
        <h1 className="settings-title">Account Settings</h1>
        {serverError && <div className="server-error">{serverError}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
            />
            {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
            />
            <div className="password-hint">
              Must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*)
            </div>
            {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Changing password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </>
  );
};

export default UserSettings;
