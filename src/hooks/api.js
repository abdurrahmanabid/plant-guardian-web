import axios from 'axios';

// Create an instance with your base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // আপনার backend URL (https://...)
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // Token-based auth: credentials দরকার নেই
});

// Attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
// api.interceptors.response.use(...)

export default api;
