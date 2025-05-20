import axios from "axios";
import { getAccessToken, getAdminToken } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api/referral";

export const getMyReferralCode = async () => {
  const token = getAccessToken();
  const res = await axios.get(`${BASE_URL}/code`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMyReferrals = async () => {
  const token = getAccessToken();
  const res = await axios.get(`${BASE_URL}/my-referrals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAllReferrals = async () => {
  const token = getAdminToken();
  const res = await axios.get(`${BASE_URL}/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const markRewardGiven = async (id) => {
  const token = getAdminToken();
  const res = await axios.put(`${BASE_URL}/reward/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
