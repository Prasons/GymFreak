import axios from "axios";
import { getAdminToken, getAccessToken } from "../utils/auth";
const API_BASE = "http://localhost:8080/api/cart"; // Updated port to 8080
const API_BASE_Pay = "http://localhost:8080/api/payment"; // Updated port to 8080

export const getCartItems = async (token) => {
  try {
    const response = await axios.get(API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw error;
  }
};

export const addToCart = async (orderedItems) => {
  try {
    const token = getAccessToken();
    const response = await axios.post(
      `${API_BASE}/items`,
      orderedItems,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding items to cart:", error);
    throw error;
  }
};

export const removeFromCart = async (cartItemId, token) => {
  try {
    const response = await axios.delete(`${API_BASE}/items/${cartItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
};

export const epayment = async (data) => {
  try {
    const token = getAccessToken();
    const response = await axios.post(
      `${API_BASE_Pay}/epayment`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in payment:", error);
    throw error;
  }
};
