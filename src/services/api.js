import axios from 'axios';
import API_URL from '../config/api';

const API_BASE_URL = `${API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchStories = async (params = {}) => {
  const response = await apiClient.get('/stories/', { params });
  return response.data.stories || [];
};

export const fetchStory = async (id) => {
  const response = await apiClient.get(`/stories/${id}`);
  return response.data;
};

export const fetchRelated = async (id) => {
  try {
    const response = await apiClient.get(`/stories/${id}/related`);
    return response.data;
  } catch (error) {
    console.log('No related stories available');
    return [];
  }
};

export const submitStory = async (formData) => {
  const response = await apiClient.post('/stories/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteStory = async (id) => {
  const response = await apiClient.delete(`/stories/${id}`);
  return response.data;
};

export const likeStory = async (id) => {
  const response = await apiClient.post(`/stories/${id}/like`);
  return response.data;
};

export const shareStory = async (id) => {
  const response = await apiClient.post(`/stories/${id}/share`);
  return response.data;
};

export const fetchAnalytics = async () => {
  const response = await apiClient.get('/analytics/summary');
  return response.data;
};

export const fetchUserAnalytics = async (userId) => {
  const response = await apiClient.get(`/analytics/user/${userId}`);
  return response.data;
};

export const fetchPathways = async () => {
  const response = await apiClient.get('/pathways/');
  return response.data;
};

export const fetchPathway = async (id) => {
  const response = await apiClient.get(`/pathways/${id}`);
  return response.data;
};

export const updatePathwayProgress = async (pathwayId, storyId) => {
  const response = await apiClient.post(`/pathways/${pathwayId}/progress`, {
    story_id: storyId
  });
  return response.data;
};

export const fetchUserPathwayProgress = async () => {
  const response = await apiClient.get('/pathways/user/progress');
  return response.data;
};

export const login = async (credentials) => {
  const response = await apiClient.post('/users/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('/users/register', userData);
  return response.data;
};

export const fetchUserProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};

export default apiClient;