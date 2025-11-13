import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/api';

const styles = `
  .list-container {
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .list-title {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 25px;
  }
  
  .filters-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 25px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .filter-input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .filter-btn {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .filter-btn:hover {
    background-color: #2980b9;
  }
  
  .add-btn {
    background-color: #27ae60;
    margin-bottom: 20px;
    padding: 12px 25px;
    font-size: 16px;
  }
  
  .add-btn:hover {
    background-color: #229954;
  }
  
  .table-container {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .table thead {
    background-color: #f8f9f9;
    border-bottom: 2px solid #ddd;
  }
  
  .table th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #2c3e50;
    cursor: pointer;
    user-select: none;
  }
  
  .table th:hover {
    background-color: #ecf0f1;
  }
  
  .table tbody tr {
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  }
  
  .table tbody tr:hover {
    background-color: #f8f9f9;
  }
  
  .table td {
    padding: 15px;
    color: #555;
  }
  
  .rating-badge {
    background-color: #f39c12;
    color: white;
    padding: 5px 10px;
    border-radius: 6px;
    font-weight: bold;
  }

  .actions { display:flex; gap:8px }
  .btn { padding:8px 12px; border:none; border-radius:6px; cursor:pointer }
  .btn.view { background:#3498db; color:white }
  .btn.edit { background:#f39c12; color:white }
  .btn.delete { background:#e74c3c; color:white }
  
  .loading, .error {
    text-align: center;
    padding: 20px;
    font-size: 16px;
  }
  
  .error {
    color: #e74c3c;
  }
  
  .sort-indicator {
    margin-left: 5px;
    font-size: 12px;
  }
`;

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [sort, setSort] = useState({ field: 'name', direction: 'asc' });

  const fetchStores = useCallback(async (updatedFilters = filters, updatedSort = sort) => {
    try {
      setLoading(true);
      const params = {
        ...updatedFilters,
        sortBy: updatedSort.field,
        sortDir: updatedSort.direction
      };
      const response = await adminService.listStores(params);
      setStores(response.data.stores);
    } catch (error) {
      setError('Failed to load stores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchStores(filters, sort);
  };

  const handleSort = (field) => {
    const newSort = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    };
    setSort(newSort);
    fetchStores(filters, newSort);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="list-container">
        <h1 className="list-title">Stores Management</h1>
        
        <button className="filter-btn add-btn" onClick={() => window.location.href = '/admin/stores/add'}>
          + Add New Store
        </button>
        
        <div className="filters-section">
          <div className="filter-row">
            <input
              type="text"
              className="filter-input"
              placeholder="Search by name"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
            />
            <input
              type="email"
              className="filter-input"
              placeholder="Search by email"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
            />
            <input
              type="text"
              className="filter-input"
              placeholder="Search by address"
              value={filters.address}
              onChange={(e) => handleFilterChange('address', e.target.value)}
            />
          </div>
          <button className="filter-btn" onClick={handleApplyFilters}>Apply Filters</button>
        </div>
        
        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Loading stores...</div>}
        
        {!loading && stores.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Name
                    {sort.field === 'name' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th onClick={() => handleSort('email')}>
                    Email
                    {sort.field === 'email' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th onClick={() => handleSort('address')}>
                    Address
                    {sort.field === 'address' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th onClick={() => handleSort('average_rating')}>
                    Average Rating
                    {sort.field === 'average_rating' && <span className="sort-indicator">{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td><span className="rating-badge">⭐ {store.average_rating}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn view" onClick={() => window.location.href = `/admin/stores/${store.id}?mode=view`}>
                          View
                        </button>
                        <button className="btn edit" onClick={() => window.location.href = `/admin/stores/${store.id}?mode=edit`}>
                          Edit
                        </button>
                        <button className="btn delete" onClick={async () => {
                          if (!window.confirm('Delete this store?')) return;
                          try {
                            await adminService.deleteStore(store.id);
                            fetchStores();
                          } catch (err) { console.error(err); alert('Failed to delete store'); }
                        }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && stores.length === 0 && !error && (
          <div className="loading">No stores found</div>
        )}
      </div>
    </>
  );
};

export default StoresList;
