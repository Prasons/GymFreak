// khalti.js
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const KHALTI_BASE_URL = 'https://khalti.com/api/v2';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'your_khalti_secret_key'; // Preferably from .env

// Axios instance
const khaltiApi = axios.create({
  baseURL: KHALTI_BASE_URL,
  headers: {
    Authorization: `Key ${KHALTI_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

/**
 * Initiates payment (usually from frontend using Khalti Checkout widget)
 * This wrapper is more useful for server-side verification
 */

/**
 * Verifies a Khalti payment
 * @param {string} token - The transaction token from Khalti
 * @param {number} amount - Amount in paisa (e.g., Rs. 100 = 10000)
 */
export const verifyPayment = async (token, amount) => {
  try {
    const response = await khaltiApi.post('/payment/verify/', new URLSearchParams({ token, amount }));
    return response.data;
  } catch (err) {
    throw new Error(`Khalti verification failed: ${err.response?.data?.detail || err.message}`);
  }
};

/**
 * (Optional) Check wallet balance of merchant
 * Only available for authorized merchants
 */
export const getBalance = async () => {
  try {
    const response = await khaltiApi.get('/wallet/lookup/');
    return response.data;
  } catch (err) {
    throw new Error(`Balance lookup failed: ${err.response?.data?.detail || err.message}`);
  }
};
