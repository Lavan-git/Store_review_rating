import React, { useEffect, useState, useCallback } from 'react';
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
  .error { color:#e74c3c }
`;

const StoreOwnerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ field: 'created_at', direction: 'desc' });

  const fetchDashboard = useCallback(async (updatedSort = sort) => {
    try {
      setLoading(true);
      const response = await storeOwnerService.getDashboard();
      let ratings = response.data.ratings || [];
      
      // Client-side sorting for simplicity
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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

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
              {dashboard.ratings.length > 0 ? (
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
