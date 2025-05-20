import axios from "axios";
import { getAccessToken, getAdminToken, isAuthenticated } from "../utils/auth";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8080/api/training-schedules",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending cookies if using httpOnly cookies
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Always add auth header for all endpoints except public ones
    if (config.url !== "/") {
      // For admin routes, always try to use admin token first
      const adminToken = getAdminToken();
      const userToken = getAccessToken();
      
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      } else {
        console.warn('No authentication token found');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // If this is a retry or we don't have a token, reject immediately
      if (originalRequest._retry || !getAccessToken()) {
        // Clear auth data and redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?sessionExpired=true';
        }
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      }
      
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token if possible
        // For now, we'll just redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?sessionExpired=true';
        }
        return Promise.reject(new Error('Session expired. Please log in again.'));
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

export const getTrainingSchedules = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching training schedules:", error);
    throw error;
  }
};

export const createTrainingSchedule = async (schedule) => {
  try {
    const response = await api.post("/", schedule);
    return response.data;
  } catch (error) {
    console.error("Error creating training schedule:", error);
    throw error;
  }
};

export const updateTrainingSchedule = async (id, schedule) => {
  try {
    const response = await api.put(`/${id}`, schedule);
    return response.data;
  } catch (error) {
    console.error(`Error updating training schedule ${id}:`, error);
    throw error;
  }
};

export const deleteTrainingSchedule = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting training schedule ${id}:`, error);
    throw error;
  }
};

export const getUserTrainingSchedules = async () => {
  try {
    const response = await api.get("/user/enrollments");
    return response.data;
  } catch (error) {
    console.error("Error fetching user training schedules:", error);
    throw error;
  }
};

export const enrollUserTrainingSchedules = async (schedule_ids) => {
  try {
    const response = await api.post("/user/enrollments", { schedule_ids });
    return response.data;
  } catch (error) {
    console.error("Error enrolling in training schedules:", error);
    throw error;
  }
};

export const unenrollUserTrainingSchedule = async (schedule_id) => {
  try {
    const response = await api.delete(`/user/enrollments/${schedule_id}`);
    return response.data;
  } catch (error) {
    console.error(`Error unenrolling from training schedule ${schedule_id}:`, error);
    throw error;
  }
};

export const unenrollAllUserTrainingSchedules = async () => {
  try {
    const response = await api.delete("/user/enrollments");
    return response.data;
  } catch (error) {
    console.error("Error unenrolling from all training schedules:", error);
    throw error;
  }
};
