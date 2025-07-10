
import axios from 'axios';
import config from '../config/config.js';

// Create axios instance
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  getUserById: (userId) => api.get(`/auth/user/${userId}`),
};

// Recipe API
export const recipeAPI = {
  getAll: (params) => api.get('/recipes', { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  getByUser: (userId) => api.get(`/recipes/user/${userId}`),
  create: (recipeData, config) => api.post('/recipes', recipeData, config),
  update: (id, recipeData) => api.put(`/recipes/${id}`, recipeData),
  delete: (id) => api.delete(`/recipes/${id}`),
  rate: (id, rating) => api.post(`/recipes/${id}/rate`, { rating }),
  like: (id) => api.post(`/recipes/${id}/like`),
  getLikeStatus: (id) => api.get(`/recipes/${id}/like-status`),
};

// Image API
export const imageAPI = {
  uploadProfile: (formData) => api.post('/images/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadRecipe: (formData) => api.post('/images/recipe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  toggleUserStatus: (userId) => api.patch(`/admin/users/${userId}/status`),
};

export default api; 
