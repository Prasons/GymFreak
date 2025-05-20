import axios from "axios";

const API_BASE = "http://localhost:8080/api/cart"; // Updated port to 8080

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

export const addToCart = async (product_id, quantity, token) => {
  try {
    const response = await axios.post(
      `${API_BASE}/items`,
      { product_id, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding item to cart:", error);
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
