import axios from 'axios';
import API_URL from '../config/api';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const cache    = new Map();
const inflight = new Map();  // request deduplication
const CACHE_TTL = 60 * 1000;

const cached = (key, fetcher) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);

  // Return the same in-flight promise if a request for this key is already running
  if (inflight.has(key)) return inflight.get(key);

  const promise = fetcher()
    .then(data => {
      cache.set(key, { data, ts: Date.now() });
      return data;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
};

export const invalidateCache = (key) => { cache.delete(key); inflight.delete(key); };
export const clearCache      = ()    => { cache.clear();     inflight.clear();     };

export const fetchStories = (params = {}) =>
  cached(`stories:${JSON.stringify(params)}`, async () => {
    const res = await apiClient.get('/stories/', { params });
    return res.data.stories || [];
  });

export const fetchStory = (id) =>
  cached(`story:${id}`, async () => {
    const res = await apiClient.get(`/stories/${id}`);
    return res.data;
  });

export const fetchRelated = async (id) => {
  try {
    const res = await apiClient.get(`/stories/${id}/related`);
    return res.data;
  } catch {
    return [];
  }
};

export const fetchAnalytics = () =>
  cached('analytics:summary', async () => {
    const res = await apiClient.get('/analytics/summary');
    return res.data;
  });

export const fetchUserAnalytics = async (userId) => {
  const res = await apiClient.get(`/analytics/user/${userId}`);
  return res.data;
};

export const fetchPathways = () =>
  cached('pathways:all', async () => {
    const res = await apiClient.get('/pathways/');
    return res.data;
  });

export const fetchPathway = (id) =>
  cached(`pathway:${id}`, async () => {
    const res = await apiClient.get(`/pathways/${id}`);
    return res.data;
  });

export const fetchUserPathwayProgress = async () => {
  const res = await apiClient.get('/pathways/user/progress');
  return res.data;
};

export const submitStory = async (formData) => {
  const res = await apiClient.post('/stories/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache();
  return res.data;
};

export const deleteStory = async (id) => {
  const res = await apiClient.delete(`/stories/${id}`);
  invalidateCache(`story:${id}`);
  return res.data;
};

export const likeStory = async (id) => {
  const res = await apiClient.post(`/stories/${id}/like`);
  invalidateCache(`story:${id}`);
  return res.data;
};

export const shareStory = async (id) => {
  const res = await apiClient.post(`/stories/${id}/share`);
  invalidateCache(`story:${id}`);
  return res.data;
};

export const updatePathwayProgress = async (pathwayId, storyId) => {
  const res = await apiClient.post(`/pathways/${pathwayId}/progress`, { story_id: storyId });
  return res.data;
};

export const login = async (credentials) => {
  const res = await apiClient.post('/users/login', credentials);
  return res.data;
};

export const register = async (userData) => {
  const res = await apiClient.post('/users/register', userData);
  return res.data;
};

export const fetchUserProfile = async () => {
  const res = await apiClient.get('/users/profile');
  return res.data;
};

export default apiClient;