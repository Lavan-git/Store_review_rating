import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';

const styles = `
  .dashboard-container { padding:32px; max-width:1300px; margin:0 auto; font-family:Arial,sans-serif }
  .dashboard-title { font-size:32px; color:#333; margin-bottom:28px; font-weight:700 }
  .dashboard-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:22px; margin-bottom:36px }
  .dashboard-card { background:#fff; padding:28px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06); text-align:center; border-top:4px solid #3498db }
  .card-label { color:#888; font-size:13px; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px; font-weight:600 }
  .card-value { font-size:44px; color:#3498db; font-weight:700 }
  .actions-section { background:#fff; padding:28px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06) }
  .actions-title { font-size:18px; color:#333; margin-bottom:18px; font-weight:700 }
  .action-buttons { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:14px }
  .action-btn { padding:10px 16px; background:#3498db; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600 }
  .action-btn:hover { opacity:0.95; background:#2980b9 }
  .loading { text-align:center; padding:20px; color:#888 }
`;

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      setError('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '20px', color: '#7f8c8d'}} className="loading">Loading dashboard...</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        
        {error && <div style={{color: '#e74c3c', marginBottom: '20px'}}>{error}</div>}
        
        {dashboard && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-label">Total Users</div>
                <div className="card-value">{dashboard.totalUsers}</div>
              </div>
              <div className="dashboard-card">
                <div className="card-label">Total Stores</div>
                <div className="card-value">{dashboard.totalStores}</div>
              </div>
              <div className="dashboard-card">
                <div className="card-label">Total Ratings</div>
                <div className="card-value">{dashboard.totalRatings}</div>
              </div>
            </div>
            
            <div className="actions-section">
              <h2 className="actions-title">Management</h2>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => window.location.href = '/admin/users'}>
                  View Users
                </button>
                <button className="action-btn" onClick={() => window.location.href = '/admin/stores'}>
                  View Stores
                </button>
                <button className="action-btn" onClick={() => window.location.href = '/admin/users/add'}>
                  Add User
                </button>
                <button className="action-btn" onClick={() => window.location.href = '/admin/stores/add'}>
                  Add Store
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
