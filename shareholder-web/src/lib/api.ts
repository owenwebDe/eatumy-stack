import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('shareholder_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Disabled auto-redirect for testing bypass
    /*
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shareholder_token');
        // Optional: Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
      }
    }
    */
    return Promise.reject(error);
  }
);

export default api;
