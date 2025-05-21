import axios from 'axios';
import { getAdminToken } from '../utils/auth';

const BASE_URL = 'http://localhost:8080/api/admin';

// Admin authentication
export const adminLogin = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

// Admin profile
export const getAdminProfile = async () => {
  try {
    const token = getAdminToken();
    const response = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

export const updateAdminProfile = async (profileData) => {
  try {
    const token = getAdminToken();
    const response = await axios.put(`${BASE_URL}/me`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
};

export const changeAdminPassword = async (currentPassword, newPassword) => {
  try {
    const token = getAdminToken();
    const response = await axios.put(
      `${BASE_URL}/me/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error changing admin password:', error);
    throw error;
  }
};

// Admin management
export const getAdmins = async () => {
  try {
    const token = getAdminToken();
    const response = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const registerAdmin = async (adminData) => {
  try {
    const token = getAdminToken();
    const response = await axios.post(BASE_URL, adminData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error registering admin:', error);
    throw error;
  }
};

export const updateAdminStatus = async (id, status) => {
  try {
    const token = getAdminToken();
    const response = await axios.put(
      `${BASE_URL}/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const token = getAdminToken();
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};
