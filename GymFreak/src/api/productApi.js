import axios from 'axios';
import { getAdminToken, isAdmin } from '../utils/auth';
import { handleApiError } from './errorHandler';

const BASE_URL = '/api/products';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (token expired or invalid)
      console.error('Authentication error:', error.response.data);
      // You might want to redirect to login or refresh the token here
    }
    return Promise.reject(error);
  }
);

export const getProducts = async () => {
  try {
    const response = await api.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    handleApiError(error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    if (!isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const response = await api.post(BASE_URL, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    handleApiError(error);
    throw error;
  }
};

export const updateProduct = async (productData,id,image) => {
  try {
    if (!isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }
const headers = image? {
        'Content-Type': 'multipart/form-data',
      }:{'Content-Type': 'application/json'}
    const response = await api.put(BASE_URL+'/'+id+"?hasimage="+image, productData, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    handleApiError(error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    if (!isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    handleApiError(error);
    throw error;
  }
};
