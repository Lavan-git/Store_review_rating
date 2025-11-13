import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { adminService } from '../services/api';

const UserEditor = ({ user, refresh, isReadOnly }) => {
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '', address: user.address || '', role: user.role || '' });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdminTarget] = useState(user.role === 'admin');

  useEffect(() => {
    setForm({ name: user.name || '', email: user.email || '', address: user.address || '', role: user.role || '' });
  }, [user]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setError('');
      const payload = { ...form };
      if (password) payload.password = password;
      await adminService.updateUser(user.id, payload);
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(user.id);
      window.location.href = '/admin/users';
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="details-row">
        <div className="details-label">Name</div>
        <input
          className="details-value"
          style={{ width: '100%' }}
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={isReadOnly}
        />
      </div>

      <div className="details-row">
        <div className="details-label">Email</div>
        <input
          className="details-value"
          style={{ width: '100%' }}
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={isReadOnly}
        />
      </div>

      <div className="details-row">
        <div className="details-label">Address</div>
        <textarea
          className="details-value"
          style={{ width: '100%' }}
          rows="3"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          disabled={isReadOnly}
        />
      </div>

      <div className="details-row">
        <div className="details-label">Role</div>
        <select
          value={form.role}
          onChange={(e) => handleChange('role', e.target.value)}
          disabled={isReadOnly}
        >
          <option value="normal_user">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="details-row">
        <div className="details-label">Reset Password (optional)</div>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isReadOnly}
        />
      </div>

      <div className="button-group">
        {!isReadOnly ? (
          <>
            <button className="back-btn save-btn" onClick={handleSave}>✓ Save</button>
            {!isAdminTarget && <button className="back-btn delete-btn" onClick={handleDelete}>🗑 Delete</button>}
          </>
        ) : (
          <>
            {/* In read-only mode we don't show Save/Delete. Parent provides Edit button. */}
          </>
        )}
      </div>
    </div>
  );
};

const styles = `
  .details-container { max-width:750px; margin:40px auto; padding:32px; background:#fff; border-radius:14px; box-shadow:0 8px 32px rgba(0,0,0,0.08); font-family:Arial,sans-serif }
  .details-title { font-size:28px; color:#333; margin-bottom:28px; font-weight:700; margin-top:16px }
  .details-row { margin-bottom:22px; padding-bottom:18px; border-bottom:1px solid #f0f0f0 }
  .details-row:last-of-type { border-bottom:none; padding-bottom:0 }
  .details-label { font-size:13px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px }
  .details-value { font-size:16px; color:#333; font-weight:500 }
  input, textarea, select { width:100%; padding:11px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif; box-sizing:border-box }
  input:focus, textarea:focus, select:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .button-group { margin-top:28px; display:flex; gap:10px }
  .back-btn { padding:10px 18px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; transition:opacity 0.2s }
  .back-btn:hover { opacity:0.95 }
  .edit-btn { background:#f39c12; color:#fff }
  .delete-btn { background:#e74c3c; color:#fff }
  .save-btn { background:#27ae60; color:#fff }
  .cancel-btn { background:#95a5a6; color:#fff }
  .view-btn { background:#3498db; color:#fff }
  .error { background:#fee; color:#c0392b; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #c0392b; font-weight:500 }
  .success { background:#e8f8f0; color:#27ae60; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #27ae60; font-weight:500 }
  .loading { text-align:center; padding:20px; color:#888; font-size:16px }
  .readonly-note { font-size:13px; color:#666; margin-bottom:12px }
`;

const UserDetails = () => {
  const { userId } = useParams();
  const location = useLocation();
  const mode = new URLSearchParams(location.search).get('mode') || 'view';
  const isReadOnly = mode === 'view';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUserDetails(userId);
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserDetails();
  }, [userId]);

  const goToEdit = () => {
    window.location.href = `${window.location.pathname}?mode=edit`;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="details-container">
        <button className="back-btn view-btn" onClick={() => window.history.back()}>
          ← Back
        </button>

        <h1 className="details-title">User Details</h1>

        {isReadOnly && (
          <div className="readonly-note">
            Viewing (read-only). Click{' '}
            <button
              className="back-btn edit-btn"
              style={{ padding: '6px 10px', fontSize: 13, display: 'inline-block', marginLeft: 8 }}
              onClick={goToEdit}
            >
              Edit
            </button>{' '}
            to modify.
          </div>
        )}

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Loading user details...</div>}

        {user && (
          <UserEditor
            user={user}
            refresh={() => {
              const fetchUserDetails = async () => {
                try {
                  setLoading(true);
                  const response = await adminService.getUserDetails(userId);
                  setUser(response.data);
                } catch (err) {
                  setError('Failed to load user details');
                  console.error(err);
                } finally {
                  setLoading(false);
                }
              };
              fetchUserDetails();
            }}
            isReadOnly={isReadOnly}
          />
        )}
      </div>
    </>
  );
};

export default UserDetails;
