import axios from "axios";
import { getAdminToken, getAccessToken } from "../utils/auth";

const API_URL = "http://localhost:8080/api/diet-plans";
const USER_DIET_PLANS_URL = "http://localhost:8080/api/diet-plans/users/plans";

// Get all diet plans
export const getDietPlans = async () => {
  try {
    const response = await axios.get(API_URL);
    return response;
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    throw error;
  }
};

// Get single diet plan
export const getDietPlan = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching diet plan ${id}:, error`);
    throw error;
  }
};

// Create diet plan
export const createDietPlan = async (dietPlanData) => {
  const token = getAdminToken();
  const response = await axios.post(API_URL, dietPlanData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update diet plan
export const updateDietPlan = async (id, dietPlanData) => {
  const token = getAdminToken();
  const response = await axios.put(`${API_URL}/${id}`, dietPlanData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Delete diet plan
export const deleteDietPlan = async (id) => {
  const token = getAdminToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Toggle diet plan status
export const toggleDietPlanStatus = async (id) => {
  const token = getAdminToken();
  const response = await axios.patch(
    `${API_URL}/${id}/toggle-status`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// User Diet Plan Functions

// Set user's diet plan
export const setUserDietPlan = async (planIds) => {
  try {
    const token = getAccessToken();
    const response = await axios.post(
      USER_DIET_PLANS_URL,
      { planIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's current diet plan
export const getUserDietPlan = async () => {
  try {
    const token = getAccessToken();
    const response = await axios.get(USER_DIET_PLANS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // Return empty array if no diet plan found (404)
    if (error.response?.status === 404) {
      return [];
    }
    throw error.response?.data || error.message;
  }
};

// Remove user's diet plan
export const removeUserDietPlan = async (planId) => {
  try {
    const token = getAccessToken();
    const response = await axios.delete(USER_DIET_PLANS_URL+`/${planId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete all user diet plans (admin only)
export const deleteUserDietPlans = async () => {
  try {
    const token = getAccessToken();
    const response = await axios.delete(
      `${USER_DIET_PLANS_URL}/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};