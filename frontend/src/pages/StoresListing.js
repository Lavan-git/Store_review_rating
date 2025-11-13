import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const styles = `
  .stores-container { padding:32px; max-width:1300px; margin:0 auto; font-family:Arial,sans-serif }
  .stores-title { font-size:32px; color:#333; margin-bottom:26px; font-weight:700 }
  .search-section { background:#fff; padding:22px; border-radius:12px; margin-bottom:26px; box-shadow:0 6px 20px rgba(0,0,0,0.06); display:flex; gap:12px }
  .search-input { flex:1; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:Arial,sans-serif }
  .search-input:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .search-btn { padding:10px 22px; background:#3498db; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px }
  .search-btn:hover { opacity:0.95; background:#2980b9 }
  .stores-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:22px }
  .store-card { background:#fff; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06); overflow:hidden; transition:transform 0.2s, box-shadow 0.2s }
  .store-card:hover { transform:translateY(-6px); box-shadow:0 8px 28px rgba(0,0,0,0.1) }
  .store-header { background:#f8f9fa; padding:18px; border-bottom:1px solid #e6e6e6 }
  .store-name { font-size:18px; font-weight:700; color:#333; margin-bottom:6px }
  .store-address { font-size:13px; color:#888 }
  .store-body { padding:18px }
  .rating-info { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px }
  .rating-badge { background:#f39c12; color:#fff; padding:8px 14px; border-radius:8px; font-weight:700; font-size:14px }
  .user-rating { font-size:14px; color:#666 }
  .user-rating-badge { background:#3498db; color:#fff; padding:5px 10px; border-radius:6px; margin-left:8px; font-weight:600; font-size:12px }
  .rating-form { margin-top:16px; padding-top:16px; border-top:1px solid #e6e6e6 }
  .rating-input { width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; margin-bottom:10px; font-family:Arial,sans-serif }
  .rating-input:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .rating-btn { width:100%; padding:10px; background:#27ae60; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px }
  .rating-btn:hover { opacity:0.95; background:#229954 }
  .rating-btn:disabled { background:#95a5a6; cursor:not-allowed }
  .loading, .error { text-align:center; padding:20px; font-size:16px }
  .error { color:#e74c3c }
  .success-msg { background:#e8f8f0; color:#27ae60; padding:12px; border-radius:8px; margin-bottom:20px; border-left:4px solid #27ae60 }
  .comment-textarea { width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:13px; margin-bottom:10px; font-family:Arial,sans-serif; resize:vertical; min-height:70px }
  .comment-textarea:focus { outline:0; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1) }
  .comment-section { margin-top:15px; padding-top:15px; border-top:1px solid #e6e6e6; background:#f9fafb; padding:12px; border-radius:8px; font-size:13px }
  .comment-text { color:#666; font-style:italic; line-height:1.5 }
`;

const StoresListing = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingRatings, setSubmittingRatings] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  useAuth();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (search = '') => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await userService.listStores(params);
      setStores(response.data.stores);
    } catch (error) {
      setError('Failed to load stores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores(searchTerm);
  };

  const handleRatingChange = (storeId, rating) => {
    setStores(stores.map(store =>
      store.id === storeId ? { ...store, tempRating: rating } : store
    ));
  };

  const handleCommentChange = (storeId, comment) => {
    setStores(stores.map(store =>
      store.id === storeId ? { ...store, tempComment: comment.substring(0, 500) } : store
    ));
  };

  const handleSubmitRating = async (storeId) => {
    const store = stores.find(s => s.id === storeId);
    
    // If it's a new rating, rating is required. If updating existing rating, rating can be optional
    if (!store.userRating && !store.tempRating) {
      setError('Please select a rating');
      return;
    }

    setSubmittingRatings(prev => ({ ...prev, [storeId]: true }));
    try {
      // Use tempRating if provided, otherwise use existing rating
      const ratingValue = store.tempRating ? parseInt(store.tempRating) : store.userRating;
      await userService.submitRating(storeId, ratingValue, store.tempComment || store.userComment || null);
      setSuccessMessage('Rating updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStores();
    } catch (error) {
      setError('Failed to submit rating');
      console.error(error);
    } finally {
      setSubmittingRatings(prev => ({ ...prev, [storeId]: false }));
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="stores-container">
        <h1 className="stores-title">Available Stores</h1>
        
        {successMessage && <div className="success-msg">{successMessage}</div>}
        {error && <div className="error">{error}</div>}
        
        <form className="search-section" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        
        {loading && <div className="loading">Loading stores...</div>}
        
        {!loading && stores.length > 0 && (
          <div className="stores-grid">
            {stores.map(store => (
              <div key={store.id} className="store-card">
                <div className="store-header">
                  <div className="store-name">{store.name}</div>
                  <div className="store-address">{store.address}</div>
                </div>
                <div className="store-body">
                  <div className="rating-info">
                    <span className="rating-badge">⭐ {store.average_rating}</span>
                    <div className="user-rating">
                      Your Rating:
                      {store.userRating ? (
                        <span className="user-rating-badge">{store.userRating}</span>
                      ) : (
                        <span className="user-rating-badge">Not Rated</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="rating-form">
                    <select
                      className="rating-input"
                      value={store.tempRating || (store.userRating || '')}
                      onChange={(e) => handleRatingChange(store.id, e.target.value)}
                    >
                      <option value="">Select Rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                    <textarea
                      className="comment-textarea"
                      placeholder="Add a comment (optional, max 500 characters)"
                      value={store.tempComment || (store.userComment || '')}
                      onChange={(e) => handleCommentChange(store.id, e.target.value.substring(0, 500))}
                      maxLength="500"
                    />
                    <button
                      className="rating-btn"
                      onClick={() => handleSubmitRating(store.id)}
                      disabled={submittingRatings[store.id]}
                    >
                      {submittingRatings[store.id] ? 'Submitting...' : (store.userRating ? 'Update Rating' : 'Submit Rating')}
                    </button>
                  </div>
                  
                  {store.userComment && (
                    <div className="comment-section">
                      <strong>Your Review:</strong>
                      <div className="comment-text">{store.userComment}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && stores.length === 0 && !error && (
          <div className="loading">No stores found</div>
        )}
      </div>
    </>
  );
};

export default StoresListing;
