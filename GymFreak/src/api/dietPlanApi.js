import axios from "axios";
import { getAccessToken, getAdminToken } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api/diet-plans";

export const getDietPlans = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const createDietPlan = async (plan) => {
  const token = getAdminToken();
  const res = await axios.post(BASE_URL, plan, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateDietPlan = async (id, plan) => {
  const token = getAdminToken();
  const res = await axios.put(`${BASE_URL}/${id}`, plan, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteDietPlan = async (id) => {
  const token = getAdminToken();
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUserDietPlan = async () => {
  const token = getAccessToken();
  const res = await axios.get(`${BASE_URL}/user/selected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const setUserDietPlan = async (dietplan_ids) => {
  const token = getAccessToken();
  const res = await axios.post(
    `${BASE_URL}/user/selected`,
    { dietplan_ids },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const removeUserDietPlan = async (dietplan_id) => {
  const token = getAccessToken();
  const res = await axios.delete(`${BASE_URL}/user/selected/${dietplan_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteUserDietPlans = async () => {
  const token = getAccessToken();
  const res = await axios.delete(`${BASE_URL}/user/selections`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
