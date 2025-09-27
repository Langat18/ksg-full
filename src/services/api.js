import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE });

export const fetchStories = (params) => api.get('/stories', { params }).then((r) => r.data);
export const fetchStory = (id) => api.get(`/stories/${id}`).then((r) => r.data);
export const submitStory = (formData) => api.post('/stories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const fetchRelated = (id) => api.get(`/stories/${id}/related`).then((r) => r.data);
export const fetchAnalytics = () => api.get('/analytics/summary').then((r) => r.data);

export default api;
