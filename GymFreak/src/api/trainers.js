import axios from 'axios';
import { getAccessToken, getAdminToken } from '../utils/auth';

const BASE_URL = 'http://localhost:8080/api/trainers';

// Trainer authentication
export const loginTrainer = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    // Handle axios error response
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Login error response:', error.response.data);
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
      throw error;
    }
  }
};

export const registerTrainer = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Trainer profile
export const getProfile = async () => {
  try {
    const token = getAccessToken();
    const response = await axios.get(`${BASE_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const token = getAccessToken();
    const response = await axios.put(`${BASE_URL}/profile/me`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Admin user management
export const getAllTrainers = async () => {
  try {
    const token = getAdminToken();
    const response = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getTrainerById = async (id) => {
  try {
    const token = getAdminToken();
    const response = await axios.get(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateTrainer = async (id, userData) => {
  try {
    const token = getAdminToken();
    const response = await axios.put(`${BASE_URL}/${id}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const changeTrainerStatus = async (id, status) => {
  try {
    const token = getAdminToken();
    const response = await axios.patch(
      `${BASE_URL}/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error changing user status:', error);
    throw error;
  }
};

export const deleteTrainer = async (id) => {
  try {
    const token = getAdminToken();
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
