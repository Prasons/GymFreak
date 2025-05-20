import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearAuthData, isAdmin } from "../utils/auth.js";
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing the token, add the request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const isAdminUser = isAdmin();
        const refreshEndpoint = isAdminUser 
          ? 'http://localhost:8080/api/admin/refresh-token'
          : 'http://localhost:8080/api/auth/refresh-token';
          
        const response = await axios.post(refreshEndpoint, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Save the new tokens
        saveTokens({
          accessToken,
          refreshToken: newRefreshToken,
          isAdmin: isAdmin()
        });

        // Update the Authorization header
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        
        // Process any queued requests
        processQueue(null, accessToken);
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth data and redirect to login
        console.error('Failed to refresh token:', refreshError);
        clearAuthData(isAdmin());
        
        // Redirect to login page
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        
        // Reject all queued requests
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        const { data } = await axios.post(
          "http://localhost:8080/api/refresh-token",
          {
            refreshToken,
          }
        );
        // Save the new access token
        saveTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
