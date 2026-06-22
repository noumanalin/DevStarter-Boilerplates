import api from "../axios.js";

/* -----------------------------
UPLOAD MEDIA
------------------------------ */
export const uploadMedia = async (formData) => {
  const { data } = await api.post("/media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/* -----------------------------
GET ALL MEDIA
------------------------------ */
export const getAllMedia = async () => {
  const { data } = await api.get("/media");
  return data;
};

/* -----------------------------
GET MEDIA STATS
------------------------------ */
export const getMediaStats = async () => {
  const { data } = await api.get("/media/stats");
  return data;
};

/* -----------------------------
GET CLOUDINARY USAGE
------------------------------ */
export const getCloudinaryUsage = async () => {
  const { data } = await api.get("/media/cloudinary-usage");
  return data;
};

/* -----------------------------
GET SINGLE MEDIA
------------------------------ */
export const getSingleMedia = async (id) => {
  const { data } = await api.get(`/media/${id}`);
  return data;
};

/* -----------------------------
UPDATE MEDIA
------------------------------ */
export const updateMedia = async ({ id, alt_text, caption, original_name }) => {
  const { data } = await api.put(`/media/${id}`, { alt_text, caption, original_name });
  return data;
};

/* -----------------------------
DELETE MEDIA
------------------------------ */
export const deleteMedia = async (id) => {
  const { data } = await api.delete(`/media/${id}`);
  return data;
};