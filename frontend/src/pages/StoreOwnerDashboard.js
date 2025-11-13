import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeOwnerService } from '../services/api';

const styles = `
  .dashboard-container { padding:32px; max-width:1300px; margin:0 auto; font-family:Arial,sans-serif }
  .dashboard-title { font-size:32px; color:#333; margin-bottom:28px; font-weight:700 }
  .store-info { background:#fff; padding:26px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06); margin-bottom:32px }
  .store-info-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #e6e6e6 }
  .store-info-row:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0 }
  .info-label { font-weight:700; color:#333; font-size:15px }
  .info-value { color:#666; font-size:18px; font-weight:500 }
  .rating-badge { background:#f39c12; color:#fff; padding:10px 20px; border-radius:8px; font-weight:700; font-size:22px }
  .ratings-section { background:#fff; padding:26px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06) }
  .ratings-title { font-size:24px; color:#333; margin-bottom:22px; font-weight:700 }
  .ratings-table { width:100%; border-collapse:collapse; font-size:14px }
  .ratings-table thead { background:#f8f9fa; border-bottom:2px solid #ddd }
  .ratings-table th { padding:16px; text-align:left; font-weight:700; color:#333; cursor:pointer; user-select:none }
  .ratings-table th:hover { background:#ecf0f1 }
  .sort-indicator { margin-left:6px; font-size:12px }
  .ratings-table tbody tr { border-bottom:1px solid #e6e6e6 }
  .ratings-table tbody tr:hover { background:#f8f9fa }
  .ratings-table td { padding:16px; color:#666 }
  .rating-stars { background:#f39c12; color:#fff; padding:6px 12px; border-radius:8px; font-weight:700; font-size:13px }
  .comment-cell { font-size:13px; color:#888; font-style:italic; max-width:300px; white-space:pre-wrap; word-break:break-word }
  .loading, .error { text-align:center; padding:20px; font-size:16px }
  .error { color:#e74c3c; background:#fee; border-radius:8px; padding:12px; margin-bottom:16px }
  .success { color:#27ae60; background:#e8f8f0; border-radius:8px; padding:12px; margin-bottom:16px }
  .form-group { margin-bottom:20px }
  .form-label { font-size:13px; font-weight:700; color:#888; text-transform:uppercase; margin-bottom:8px; display:block }
  input, textarea { width:100%; padding:11px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif; box-sizing:border-box }
  input:focus, textarea:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  input:disabled { background:#f5f5f5; cursor:not-allowed; color:#666 }
  textarea { resize:vertical; min-height:100px }
  .btn { padding:12px 24px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; margin-right:10px }
  .btn:hover { opacity:0.9 }
  .btn-primary { background:#27ae60; color:#fff }
  .info-text { font-size:13px; color:#666; margin-top:6px }
  .create-store-form { background:#fff; padding:26px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06); max-width:700px }
`;

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sort, setSort] = useState({ field: 'created_at', direction: 'desc' });
  const [form, setForm] = useState({ name: '', address: '' });

  const fetchDashboard = useCallback(async (updatedSort = sort) => {
    try {
      setLoading(true);
      const response = await storeOwnerService.getDashboard();
      
      // If no store, set dashboard with hasStore flag
      if (!response.data.hasStore) {
        setDashboard(response.data);
        setLoading(false);
        return;
      }

      let ratings = response.data.ratings || [];
      
      // Client-side sorting
      ratings = ratings.sort((a, b) => {
        let aVal, bVal;
        if (updatedSort.field === 'user_name') {
          aVal = a.user_name || '';
          bVal = b.user_name || '';
        } else if (updatedSort.field === 'user_email') {
          aVal = a.user_email || '';
          bVal = b.user_email || '';
        } else if (updatedSort.field === 'rating') {
          aVal = a.rating || 0;
          bVal = b.rating || 0;
        } else if (updatedSort.field === 'created_at') {
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
        }
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
          return updatedSort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
          return updatedSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
      });
      
      setDashboard({ ...response.data, ratings });
    } catch (error) {
      setError('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchDashboard(sort);
  }, [sort, fetchDashboard]);

  const handleSort = (field) => {
    const newSort = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    };
    setSort(newSort);
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await storeOwnerService.createStore(form);
      setSuccess('Store created successfully!');
      setTimeout(() => {
        fetchDashboard(sort); // Refresh dashboard
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create store');
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  // Show create form if no store
  if (dashboard && !dashboard.hasStore) {
    const email = dashboard.ownerEmail || user?.email;
    
    return (
      <>
        <style>{styles}</style>
        <div className="dashboard-container">
          <h1 className="dashboard-title">Create Your Store</h1>
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          <form className="create-store-form" onSubmit={handleCreateStore}>
            <div className="form-group">
              <label className="form-label">Email (from your account)</label>
              <input type="email" value={email} disabled />
              <div className="info-text">Email is locked to your account and cannot be changed</div>
            </div>

            <div className="form-group">
              <label className="form-label">Store Name (20-60 characters)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={20}
                maxLength={60}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address (max 400 characters)</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                maxLength={400}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Store
            </button>
          </form>
        </div>
      </>
    );
  }

  // Show dashboard if store exists
  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <h1 className="dashboard-title">My Store Dashboard</h1>
        
        {error && <div className="error">{error}</div>}
        
        {dashboard && (
          <>
            <div className="store-info">
              <div className="store-info-row">
                <span className="info-label">Store Name</span>
                <span className="info-value">{dashboard.store.name}</span>
              </div>
              <div className="store-info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{dashboard.store.email}</span>
              </div>
              <div className="store-info-row">
                <span className="info-label">Address</span>
                <span className="info-value">{dashboard.store.address}</span>
              </div>
              <div className="store-info-row">
                <span className="info-label">Average Rating</span>
                <span className="rating-badge">⭐ {dashboard.averageRating}</span>
              </div>
              <div className="store-info-row">
                <span className="info-label">Total Ratings</span>
                <span className="info-value">{dashboard.totalRatings}</span>
              </div>
            </div>
            
            <div className="ratings-section">
              <h2 className="ratings-title">User Ratings</h2>
              {dashboard.ratings && dashboard.ratings.length > 0 ? (
                <table className="ratings-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('user_name')}>
                        User Name
                        {sort.field === 'user_name' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                      </th>
                      <th onClick={() => handleSort('user_email')}>
                        User Email
                        {sort.field === 'user_email' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                      </th>
                      <th onClick={() => handleSort('rating')}>
                        Rating
                        {sort.field === 'rating' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                      </th>
                      <th onClick={() => handleSort('created_at')}>
                        Date
                        {sort.field === 'created_at' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                      </th>
                      <th>Review Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.ratings.map(rating => (
                      <tr key={rating.id}>
                        <td>{rating.user_name}</td>
                        <td>{rating.user_email}</td>
                        <td><span className="rating-stars">⭐ {rating.rating}</span></td>
                        <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                        <td><div className="comment-cell">{rating.comment || '-'}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="loading">No ratings yet</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StoreOwnerDashboard;
