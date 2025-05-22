import axios from '../api/axiosInstance';

const API_URL = '/membership-plans';  // Relative URL since baseURL is already set in axiosInstance

// Get all membership plans
export const getMembershipPlans = async (activeOnly = true) => {
  try {
    const response = await axios.get(API_URL, {
      params: { active: activeOnly }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    throw error;
  }
};

// Get single membership plan
export const getMembershipPlan = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching membership plan ${id}:`, error);
    throw error;
  }
};

// Create a new membership plan
export const createMembershipPlan = async (planData) => {
  try {
    const response = await axios.post(API_URL, planData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating membership plan:', error);
    throw error;
  }
};

// Update a membership plan
export const updateMembershipPlan = async (id, planData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, planData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating membership plan ${id}:`, error);
    throw error;
  }
};

// Delete a membership plan
export const deleteMembershipPlan = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting membership plan ${id}:`, error);
    throw error;
  }
};

// Toggle membership plan status
export const toggleMembershipPlanStatus = async (id) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/toggle-status`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error toggling status for membership plan ${id}:`, error);
    throw error;
  }
};
