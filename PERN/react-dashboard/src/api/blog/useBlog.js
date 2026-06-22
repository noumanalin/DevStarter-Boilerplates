// src/hooks/useBlog.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getCategoriesPaginatedApi, getCategoryBySlugApi, getAllCategoriesAdminApi,
  createCategoryApi, updateCategoryApi, deleteCategoryApi,
  getPublicBlogsApi, getBlogBySlugApi, getBlogsForSitemapApi,
  getAllBlogsAdminApi, createBlogApi, updateBlogApi, deleteBlogApi,
} from "./blogApi.js";
import { getTokenFromStore } from "../../utils/getToken.js";

/* ─────────────────────────────────────────────
   BLOG QUERY KEYS
───────────────────────────────────────────── */
export const BLOG_KEYS = {
  all: ["blogs"],
  adminAll: (params) => ["blogs", "admin", "all", params],
  public: (params) => ["blogs", "public", params],
  slug: (slug) => ["blogs", "slug", slug],
  sitemap: ["blogs", "sitemap"],
};

/* ─────────────────────────────────────────────
   CATEGORY QUERY KEYS
───────────────────────────────────────────── */
export const CATEGORY_KEYS = {
  all: ["categories"],
  adminAll: (params) => ["categories", "admin", "all", params],
  public: (params) => ["categories", "public", params],
  slug: (slug) => ["categories", "slug", slug],
};

/* ─────────────────────────────────────────────
   PUBLIC — PAGINATED BLOG LISTING (Nexora)
───────────────────────────────────────────── */
export const useGetPublicBlogs = (params = {}) => {
  return useQuery({
    queryKey: BLOG_KEYS.public(params),
    queryFn: () => getPublicBlogsApi(params),
    staleTime: 3 * 60 * 1000,
    select: (data) => ({
      blogs: data?.data?.blogs ?? [],
      pagination: data?.data?.pagination ?? {},
    }),
  });
};

/* ─────────────────────────────────────────────
   PUBLIC — SINGLE BLOG BY SLUG
───────────────────────────────────────────── */
export const useGetBlogBySlug = (slug) => {
  return useQuery({
    queryKey: BLOG_KEYS.slug(slug),
    queryFn: () => getBlogBySlugApi(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data ?? null,
  });
};

/* ─────────────────────────────────────────────
   PUBLIC — BLOGS FOR SITEMAP
───────────────────────────────────────────── */
export const useGetBlogsForSitemap = () => {
  return useQuery({
    queryKey: BLOG_KEYS.sitemap,
    queryFn: () => getBlogsForSitemapApi(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data?.data ?? [],
  });
};

/* ─────────────────────────────────────────────
   ADMIN — ALL BLOGS (DASHBOARD)
───────────────────────────────────────────── */
export const useGetAllBlogsAdmin = (params = {}) => {
  const token = getTokenFromStore();

  return useQuery({
    queryKey: BLOG_KEYS.adminAll(params),
    queryFn: () => getAllBlogsAdminApi(params, token),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    select: (data) => ({
      blogs: data?.data?.blogs ?? [],
      pagination: data?.data?.pagination ?? {},
    }),
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

/* ─────────────────────────────────────────────
   ADMIN — CREATE BLOG
───────────────────────────────────────────── */
export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const token = getTokenFromStore();

  return useMutation({
    mutationFn: (formData) => createBlogApi(formData, token),
    onSuccess: (data) => {
      toast.success(data?.message ?? "Blog created successfully!");
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.all });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error?.response?.data?.message ??
            "Failed to create blog. Please try again."
        );
      }
    },
  });
};

/* ─────────────────────────────────────────────
   ADMIN — UPDATE BLOG
───────────────────────────────────────────── */
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  const token = getTokenFromStore();

  return useMutation({
    mutationFn: ({ id, formData }) => updateBlogApi({ id, formData }, token),
    onSuccess: (data) => {
      toast.success(data?.message ?? "Blog updated successfully!");
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.all });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error?.response?.data?.message ??
            "Failed to update blog. Please try again."
        );
      }
    },
  });
};

/* ─────────────────────────────────────────────
   ADMIN — DELETE BLOG
───────────────────────────────────────────── */
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  const token = getTokenFromStore();

  return useMutation({
    mutationFn: (id) => deleteBlogApi(id, token),
    onSuccess: (data) => {
      toast.success(data?.message ?? "Blog deleted successfully.");
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.all });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error?.response?.data?.message ?? "Failed to delete blog."
        );
      }
    },
  });
};

/* ─────────────────────────────────────────────
   PUBLIC — PAGINATED CATEGORY LISTING
───────────────────────────────────────────── */
export const useGetCategoriesPaginated = (params = {}) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.public(params),
    queryFn: () => getCategoriesPaginatedApi(params),
    staleTime: 3 * 60 * 1000,
    select: (data) => ({
      categories: data?.data?.categories ?? [],
      pagination: data?.data?.pagination ?? {},
    }),
  });
};

/* ─────────────────────────────────────────────
   PUBLIC — SINGLE CATEGORY BY SLUG
───────────────────────────────────────────── */
export const useGetCategoryBySlug = (slug) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.slug(slug),
    queryFn: () => getCategoryBySlugApi(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data ?? null,
  });
};

/* ─────────────────────────────────────────────
   ADMIN — ALL CATEGORIES (DASHBOARD)
───────────────────────────────────────────── */
export const useGetAllCategoriesAdmin = (params = {}) => {
  const token = getTokenFromStore();

  return useQuery({
    queryKey: CATEGORY_KEYS.adminAll(params),
    queryFn: () => getAllCategoriesAdminApi(params, token),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    select: (data) => ({
      categories: data?.data?.categories ?? [],
      pagination: data?.data?.pagination ?? {},
    }),
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

/* ─────────────────────────────────────────────
   ADMIN — CREATE CATEGORY
───────────────────────────────────────────── */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const token = getTokenFromStore();

  return useMutation({
    mutationFn: (formData) => createCategoryApi(formData, token),
    onSuccess: (data) => {
      toast.success(data?.message ?? "Category created successfully!");
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error?.response?.data?.message ??
            "Failed to create category. Please try again."
        );
      }
    },
  });
};

/* ─────────────────────────────────────────────
   ADMIN — UPDATE CATEGORY
───────────────────────────────────────────── */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const token = getTokenFromStore();

  return useMutation({
    mutationFn: ({ id, formData }) => updateCategoryApi({ id, formData }, token),
    onSuccess: (data) => {
      toast.success(data?.message ?? "Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error?.response?.data?.message ??
            "Failed to update category. Please try again."
        );
      }
    },
  });
};

/* ─────────────────────────────────────────────
   ADMIN — DELETE CATEGORY
───────────────────────────────────────────── */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const token = getTokenFromStore();

  return useMutation({
    mutationFn: ({ id, force = false }) => deleteCategoryApi(id, token, force),
    onSuccess: (data) => {
      toast.success(data?.message ?? "Category deleted successfully.");
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (error?.response?.status === 409) {
        toast.error(
          error?.response?.data?.message ??
            "Category has blogs attached. Use force delete to remove."
        );
      } else {
        toast.error(
          error?.response?.data?.message ?? "Failed to delete category."
        );
      }
    },
  });
};