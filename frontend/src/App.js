import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UsersList from './pages/UsersList';
import StoresList from './pages/StoresList';
import AddUser from './pages/AddUser';
import AddStore from './pages/AddStore';
import UserDetails from './pages/UserDetails';
import StoreDetails from './pages/StoreDetails';
import StoresListing from './pages/StoresListing';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import UserSettings from './pages/UserSettings';

const AppContent = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data is in localStorage on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      // User data exists but not in context, it will be restored on next login
    }
    setLoading(false);
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      {token && user && <Navbar onLogout={handleLogout} userRole={user.role} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={token && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/users"
          element={token && user?.role === 'admin' ? <UsersList /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/stores"
          element={token && user?.role === 'admin' ? <StoresList /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/users/add"
          element={token && user?.role === 'admin' ? <AddUser /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/stores/add"
          element={token && user?.role === 'admin' ? <AddStore /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/users/:userId"
          element={token && user?.role === 'admin' ? <UserDetails /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/stores/:storeId"
          element={token && user?.role === 'admin' ? <StoreDetails /> : <Navigate to="/login" />}
        />

        {/* Normal User Routes */}
        <Route
          path="/user/stores"
          element={token && user?.role === 'normal_user' ? <StoresListing /> : <Navigate to="/login" />}
        />
        <Route
          path="/user/settings"
          element={token && user?.role === 'normal_user' ? <UserSettings /> : <Navigate to="/login" />}
        />

        {/* Store Owner Routes */}
        <Route
          path="/store-owner/dashboard"
          element={token && user?.role === 'store_owner' ? <StoreOwnerDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/store-owner/settings"
          element={token && user?.role === 'store_owner' ? <UserSettings /> : <Navigate to="/login" />}
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            token && user
              ? user.role === 'admin'
                ? <Navigate to="/admin/dashboard" />
                : user.role === 'normal_user'
                ? <Navigate to="/user/stores" />
                : user.role === 'store_owner'
                ? <Navigate to="/store-owner/dashboard" />
                : <Navigate to="/login" />
              : <Navigate to="/login" />
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
