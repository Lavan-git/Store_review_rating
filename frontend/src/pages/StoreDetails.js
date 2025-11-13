import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { adminService } from '../services/api';

const styles = `
  .details-container { max-width:750px; margin:40px auto; padding:32px; background:#fff; border-radius:14px; box-shadow:0 8px 32px rgba(0,0,0,0.08); font-family:Arial,sans-serif }
  .details-title { font-size:28px; color:#333; margin-bottom:28px; font-weight:700; margin-top:16px }
  .details-row { margin-bottom:22px; padding-bottom:18px; border-bottom:1px solid #f0f0f0 }
  .details-row:last-of-type { border-bottom:none; padding-bottom:0 }
  .details-label { font-size:13px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px }
  .details-value { font-size:16px; color:#333; font-weight:500 }
  input, textarea { width:100%; padding:11px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif; box-sizing:border-box }
  input:focus, textarea:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .button-group { margin-top:28px; display:flex; gap:10px }
  .btn { padding:10px 18px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; transition:opacity 0.2s }
  .btn:hover { opacity:0.95 }
  .view-btn { background:#3498db; color:#fff }
  .edit-btn { background:#f39c12; color:#fff }
  .delete-btn { background:#e74c3c; color:#fff }
  .save-btn { background:#27ae60; color:#fff }
  .cancel-btn { background:#95a5a6; color:#fff }
  .error { background:#fee; color:#c0392b; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #c0392b; font-weight:500 }
  .success { background:#e8f8f0; color:#27ae60; padding:12px; border-radius:8px; margin-bottom:16px; border-left:4px solid #27ae60; font-weight:500 }
  .loading { text-align:center; padding:20px; color:#888; font-size:16px }
  .readonly-note { font-size:13px; color:#666; margin-bottom:12px }
`;

const StoreDetails = () => {
  const { storeId } = useParams();
  const location = useLocation();
  const mode = new URLSearchParams(location.search).get('mode') || 'view'; // default to view for safety
  const isReadOnly = mode === 'view';

  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStoreDetails(storeId);
        setStore(res.data);
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          address: res.data.address || '',
          owner_id: res.data.owner_id || ''
        });
      } catch (err) {
        setError('Failed to load store');
      } finally { setLoading(false); }
    };
    if (storeId) fetch();
  }, [storeId]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setError('');
      await adminService.updateStore(storeId, form);
      setSuccess('Store updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update store');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this store? This action cannot be undone.')) return;
    try {
      await adminService.deleteStore(storeId);
      window.location.href = '/admin/stores';
    } catch (err) {
      setError('Failed to delete store');
    }
  };

  const goToEdit = () => {
    // switch to edit mode by adding query param
    window.location.href = `${window.location.pathname}?mode=edit`;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="details-container">
        <button className="btn view-btn" onClick={() => window.history.back()}>← Back</button>
        <h1 className="details-title">Store Details</h1>

        {isReadOnly && <div className="readonly-note">Viewing (read-only). Click <button className="btn edit-btn" style={{padding:'6px 10px', fontSize:13, display:'inline-block', marginLeft:8}} onClick={goToEdit}>Edit</button> to modify.</div>}

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        {loading && <div className="loading">Loading...</div>}
        {store && (
          <div>
            <div className="details-row">
              <div className="details-label">Name</div>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="details-row">
              <div className="details-label">Email</div>
              <input
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="details-row">
              <div className="details-label">Address</div>
              <textarea
                rows="3"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="details-row">
              <div className="details-label">Owner ID</div>
              <input
                value={form.owner_id}
                onChange={(e) => handleChange('owner_id', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="button-group">
              {!isReadOnly ? (
                <>
                  <button className="btn save-btn" onClick={handleSave}>✓ Save</button>
                  <button className="btn delete-btn" onClick={handleDelete}>🗑 Delete</button>
                  <button className="btn cancel-btn" onClick={() => window.location.href = `/admin/stores/${storeId}?mode=view`}>Cancel</button>
                </>
              ) : (
                <>
                  {/* <button className="btn edit-btn" onClick={goToEdit}>✎ Edit</button> */}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StoreDetails;
