import React from 'react';

const styles = `
  .navbar {
    background-color: #2c3e50;
    color: white;
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .navbar-brand {
    font-size: 24px;
    font-weight: bold;
  }
  
  .navbar-menu {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  
  .navbar-menu a {
    color: white;
    text-decoration: none;
    cursor: pointer;
    padding: 8px 15px;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .navbar-menu a:hover {
    background-color: #34495e;
  }
  
  .logout-btn {
    background-color: #e74c3c;
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .logout-btn:hover {
    background-color: #c0392b;
  }
`;

const Navbar = ({ onLogout, userRole }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="navbar">
        <div className="navbar-brand">Store Rating App</div>
        <div className="navbar-menu">
          {userRole === 'admin' && (
            <>
              <a href="/admin/dashboard">Dashboard</a>
              <a href="/admin/users">Users</a>
              <a href="/admin/stores">Stores</a>
            </>
          )}
          {userRole === 'normal_user' && (
            <>
              <a href="/user/stores">Stores</a>
              <a href="/user/settings">Settings</a>
            </>
          )}
          {userRole === 'store_owner' && (
            <>
              <a href="/store-owner/dashboard">My Store</a>
              <a href="/store-owner/settings">Settings</a>
            </>
          )}
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
