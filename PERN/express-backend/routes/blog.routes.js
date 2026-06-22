import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import upload from "../middlewares/upload.middleware.js";
import { createBlog, getAllBlogsAdmin, getBlogsPaginated, getBlogBySlug, updateBlog, deleteBlog, 
  getNexoraPaginatedBlogs, getBlogsForSitemap } from "../controllers/blogController.js";
  
import { createCategory, getAllCategoriesAdmin, getCategoriesPaginated, getCategoryBySlug, 
  updateCategory, deleteCategory } from "../controllers/blogCategoryController.js";

const router = express.Router();

/* ─────────────────────────────────────────────
   BLOG CATEGORY ROUTES — mounted under /categories
   (registered before blog's "/:slug" wildcard so "/categories" never gets swallowed as a slug)
───────────────────────────────────────────── */
router.get("/categories/admin/all", isLoggedIn(), getAllCategoriesAdmin);
router.get("/categories", getCategoriesPaginated);
router.get("/categories/:slug", getCategoryBySlug);
router.post("/categories", isLoggedIn(["SUPER_ADMIN", "ADMIN", "PM", "SEO", "DEVELOPER"]), upload.single("image"), createCategory);
router.put("/categories/:id", isLoggedIn(["SUPER_ADMIN", "ADMIN", "PM", "SEO", "DEVELOPER"]), upload.single("image"), updateCategory);
router.delete("/categories/:id", isLoggedIn(["SUPER_ADMIN", "ADMIN", "DEVELOPER"]), deleteCategory);

/* ─────────────────────────────────────────────
   PUBLIC BLOG ROUTES
───────────────────────────────────────────── */
router.get("/nexora/paginated/blogs", getNexoraPaginatedBlogs);
router.get("/sitemap", getBlogsForSitemap);
router.get("/admin/all", isLoggedIn(), getAllBlogsAdmin);
router.get("/", getBlogsPaginated);
router.get("/:slug", getBlogBySlug);

/* ─────────────────────────────────────────────
   PROTECTED BLOG ROUTES — Dashboard / Admin only
───────────────────────────────────────────── */
router.post("/", isLoggedIn(["SUPER_ADMIN", "ADMIN", "PM", "SEO", "DEVELOPER"]), upload.single("featuredImage"), createBlog);
router.put("/:id", isLoggedIn(["SUPER_ADMIN", "ADMIN", "PM", "SEO", "DEVELOPER"]), upload.single("featuredImage"), updateBlog);
router.delete("/:id", isLoggedIn(["SUPER_ADMIN", "ADMIN", "DEVELOPER"]), deleteBlog);

export default router;