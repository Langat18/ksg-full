import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const api = axios.create({ 
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchStories = (params) => api.get('/stories', { params }).then((r) => r.data);
export const fetchStory = (id) => api.get(`/stories/${id}`).then((r) => r.data);
export const submitStory = (formData) => api.post('/stories', formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
}).then((r) => r.data);
export const fetchRelated = (id) => api.get(`/stories/${id}/related`).then((r) => r.data);
export const fetchAnalytics = () => api.get('/analytics/summary').then((r) => r.data);

export default api;