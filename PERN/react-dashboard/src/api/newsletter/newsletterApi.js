import api from "../axios.js";

/* ─────────────────────────────────────────────
   PUBLIC APIs (no token needed)
───────────────────────────────────────────── */
export const subscribeToNewsletterApi = async (data) => {
  const response = await api.post("newsletter/subscribe", data);
  return response?.data;
};

export const unsubscribeFromNewsletterApi = async (data) => {
  const response = await api.post("newsletter/unsubscribe", data);
  return response?.data;
};

/* ─────────────────────────────────────────────
   PROTECTED APIs (token required)
───────────────────────────────────────────── */

export const getAllSubscribersApi = async (token) => {
  const response = await api.get("newsletter", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response?.data;
};

export const deleteSubscriberApi = async (id, token) => {
  const response = await api.delete(`newsletter/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response?.data;
};