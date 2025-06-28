import axios from 'axios';

// Create an instance with your base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // 🔁 Replace with your actual backend URL
  timeout: 10000, // Optional: sets request timeout to 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors for auth token, error handling, etc.
// api.interceptors.request.use(...)
// api.interceptors.response.use(...)

export default api;
