// src/api/blog/blogApi.js
import api from "../axios.js";


/* ─────────────────────────────────────────────
  Blog Category PUBLIC APIs (no token needed)
───────────────────────────────────────────── */

export const getCategoriesPaginatedApi = async (params = {}) => {
  const response = await api.get("blogs/categories", { params });
  return response?.data;
};

export const getCategoryBySlugApi = async (slug) => {
  const response = await api.get(`blogs/categories/${slug}`);
  return response?.data;
};

/* ─────────────────────────────────────────────
  Blog Category PROTECTED APIs (token required)
───────────────────────────────────────────── */

export const getAllCategoriesAdminApi = async (params = {}, token) => {
  const response = await api.get("blogs/categories/admin/all", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};

export const createCategoryApi = async (formData, token) => {
  const response = await api.post("blogs/categories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};

export const updateCategoryApi = async ({ id, formData }, token) => {
  const response = await api.put(`blogs/categories/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};

export const deleteCategoryApi = async (id, token, force = false) => {
  const response = await api.delete(`blogs/categories/${id}?force=${force}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};



/* ─────────────────────────────────────────────
   PUBLIC APIs (no token needed)
───────────────────────────────────────────── */

export const getPublicBlogsApi = async (params = {}) => {
  const response = await api.get("blogs/nexora/paginated/blogs", { params });
  return response?.data;
};

export const getBlogBySlugApi = async (slug) => {
  const response = await api.get(`blogs/${slug}`);
  return response?.data;
};

export const getBlogsForSitemapApi = async () => {
  const response = await api.get("blogs/sitemap");
  return response?.data;
};

/* ─────────────────────────────────────────────
   PROTECTED APIs (token required)
───────────────────────────────────────────── */

export const getAllBlogsAdminApi = async (params = {}, token) => {
  const response = await api.get("blogs/admin/all", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};

export const createBlogApi = async (formData, token) => {
  const response = await api.post("blogs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};

export const updateBlogApi = async ({ id, formData }, token) => {
  const response = await api.put(`blogs/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};

export const deleteBlogApi = async (id, token) => {
  const response = await api.delete(`blogs/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response?.data;
};