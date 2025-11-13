import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword })
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  addUser: (data) => api.post('/admin/users', data),
  addStore: (data) => api.post('/admin/stores', data),
  listUsers: (params) => api.get('/admin/users', { params }),
  listStores: (params) => api.get('/admin/stores', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`)
  ,
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStoreDetails: (storeId) => api.get(`/admin/stores/${storeId}`),
  updateStore: (storeId, data) => api.put(`/admin/stores/${storeId}`, data),
  deleteStore: (storeId) => api.delete(`/admin/stores/${storeId}`)
};

export const userService = {
  listStores: (params) => api.get('/users/stores', { params }),
  submitRating: (storeId, rating, comment) => api.post(`/users/stores/${storeId}/rating`, { rating, comment })
};

export const storeOwnerService = {
  getDashboard: () => api.get('/store-owner/dashboard')
};
