import axios from 'axios';
import { API_BASE_URL } from '@/config/apiConfig';
import { showError } from '@/utils/toastUtils';

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Handle specific status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized – clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          showError('You do not have permission to perform this action');
          break;
        case 404:
          showError('Requested resource not found');
          break;
        case 429:
          showError('Too many requests. Please try again later.');
          break;
        case 500:
          showError('Server error. Please try again later.');
          break;
        default:
          showError(message);
      }
    } else if (error.request) {
      showError('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
