// FleetHub – Centralized Axios Client
import axios from 'axios';
import { showError } from '@/utils/toastUtils';

// Support VITE_API_URL, VITE_API_BASE_URL, or default to http://localhost:5000/api/v1
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? `${rawBaseUrl}/v1` : rawBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor – automatically attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor – handle responses and 401/403/500 errors
apiClient.interceptors.response.use(
  (response) => {
    // Return either response.data (standard API wrapper) or response
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An unexpected error occurred';

    if (status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('fleethub_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      showError('Access denied: You do not have permission for this action.');
    } else if (status === 404) {
      showError(message || 'Requested resource not found.');
    } else if (status === 500) {
      showError('Server encountered an internal error. Please try again.');
    } else if (!error.response) {
      showError('Unable to connect to FleetHub backend. Please verify your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
