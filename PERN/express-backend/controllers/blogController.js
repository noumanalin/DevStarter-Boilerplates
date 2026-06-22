import slugify from "slugify";
import { prisma } from "../config/db.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const generateUniqueSlug = async (title, excludeId = null) => {
  const base = slugify(title, { lower: true, strict: true, trim: true });

  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter++}`;
  }

  return slug;
};

/**
 * Parse a comma-separated string OR JSON array string into a JS array of strings.
 * Accepts: "a,b"  |  '["a","b"]'  |  undefined  →  []
 */
const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(",").map((v) => v.trim()).filter(Boolean);
    }
  }
  return [];
};

/**
 * Parse a JSON array of objects (used for `faqs`: [{question, answer}]).
 * Accepts a real array, a JSON string, or returns the fallback.
 */
const parseJSONArray = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const toBool = (value) => value === true || value === "true";

/**
 * Calculate reading time from HTML / plain-text content.
 * Strips HTML tags, counts words, assumes 200 wpm.
 */
const calcReadingTime = (content = "") => {
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const CATEGORY_CARD_SELECT = { id: true, name: true, slug: true, color: true, imageUrl: true };

/* ─────────────────────────────────────────────
   PUBLIC — PAGINATED BLOG LISTING FOR FRONTEND (Optimized for BlogCard)
   GET /api/blogs/nexora/paginated/blogs
   Query: ?page=1&limit=10&category=seo&search=keyword
───────────────────────────────────────────── */
export const getNexoraPaginatedBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req?.query?.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req?.query?.limit) || 10));
    const skip = (page - 1) * limit;

    const categorySlug = req?.query?.category?.trim() || null;
    const search = req?.query?.search?.trim() || null;

    const where = {
      status: "PUBLISHED",
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          featured_img_url: true,
          featured_img_alt: true,
          is_featured: true,
          authorName: true,
          authorBio: true,
          createdAt: true,
          metaTitle: true,
          metaDescription: true,
          category: { select: CATEGORY_CARD_SELECT },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const startRange = total === 0 ? 0 : skip + 1;
    const endRange = Math.min(skip + blogs.length, total);

    let dynamicMessage = "";
    if (total === 0) {
      dynamicMessage = "No blogs found.";
    } else {
      dynamicMessage = `Blogs fetched successfully. Page ${page} of ${totalPages}, showing blogs ${startRange} to ${endRange} of ${total} total blog${total !== 1 ? "s" : ""}.`;
      if (categorySlug) dynamicMessage += ` Filtered by category: "${categorySlug}".`;
      if (search) dynamicMessage += ` Searching for: "${search}".`;
    }

    return res.status(200).json({
      success: true,
      message: dynamicMessage,
      data: {
        blogs,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          startRange,
          endRange,
        },
      },
    });
  } catch (error) {
    console.error("getNexoraPaginatedBlogs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   1. PUBLIC — PAGINATED BLOG LISTING (fuller fields)
   GET /api/blogs
   Query: ?page=1&limit=10&category=seo
───────────────────────────────────────────── */
export const getBlogsPaginated = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req?.query?.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req?.query?.limit) || 10));
    const skip = (page - 1) * limit;
    const categorySlug = req?.query?.category?.trim() || null;

    const where = {
      status: "PUBLISHED",
      ...(categorySlug && { category: { slug: categorySlug } }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_img_url: true,
          featured_img_alt: true,
          featured_img_caption: true,
          is_featured: true,
          authorName: true,
          authorBio: true,
          readingTime: true,
          views: true,
          shares: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          metaTitle: true,
          metaDescription: true,
          category: { select: CATEGORY_CARD_SELECT },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully.",
      data: {
        blogs,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("getBlogsPaginated Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   2. PUBLIC — SINGLE BLOG BY SLUG
   GET /api/blogs/:slug
───────────────────────────────────────────── */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req?.params ?? {};

    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required." });
    }

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: { category: { select: CATEGORY_CARD_SELECT } },
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found." });
    }

    // Increment views
    prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    }).catch((err) => console.error("View increment failed:", err));

    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully.",
      data: blog, // schema_markup will be included automatically
    });
  } catch (error) {
    console.error("getBlogBySlug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   3. PROTECTED — ALL BLOGS FOR DASHBOARD
   GET /api/blogs/admin/all
   Query: ?page=1&limit=20&status=DRAFT|PUBLISHED&category=slug&categoryId=1&search=keyword
───────────────────────────────────────────── */
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req?.query?.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req?.query?.limit) || 20));
    const skip = (page - 1) * limit;
    const statusFilter = req?.query?.status?.toUpperCase();
    const categorySlug = req?.query?.category?.trim() || null;
    const categoryId = req?.query?.categoryId ? parseInt(req.query.categoryId) : null;
    const search = req?.query?.search?.trim() || null;

    const validStatuses = ["DRAFT", "PUBLISHED"];

    const where = {
      ...(validStatuses.includes(statusFilter) && { status: statusFilter }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(categoryId && !isNaN(categoryId) && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { authorName: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { category: { select: CATEGORY_CARD_SELECT } },
      }),
      prisma.blog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "All blogs fetched successfully.",
      data: {
        blogs,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("getAllBlogsAdmin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   4. PROTECTED — CREATE BLOG
   POST /api/blogs
   Body: multipart/form-data (featuredImage file + JSON fields)
───────────────────────────────────────────── */
export const createBlog = async (req, res) => {
  try {
    const body = req?.body ?? {};

    /* ── Required field validation ── */
    const requiredFields = ["title", "excerpt", "content", "metaTitle", "metaDescription", "authorName"];
    const missing = requiredFields.filter((f) => !body[f]?.trim());
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}.`,
      });
    }

    /* ── Featured image is required on create ── */
    if (!req?.file) {
      return res.status(400).json({
        success: false,
        message: "Featured image is required.",
      });
    }

    /* ── Validate category if provided ── */
    let categoryId = null;
    if (body?.categoryId !== undefined && body.categoryId !== "") {
      categoryId = parseInt(body.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ success: false, message: "Invalid categoryId." });
      }
      const category = await prisma.blogCategory.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found." });
      }
    }

    /* ── Upload image to Cloudinary ── */
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer, "blogs/featured-images");
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      return res.status(502).json({
        success: false,
        message: "Image upload failed. Please try again.",
        error: uploadError?.message ?? "Cloudinary error.",
      });
    }

    const title = body.title.trim();
    const metaTitle = body.metaTitle.trim();

    /* ── Auto-generate slug ── */
    const slug = await generateUniqueSlug(title);

    /* ── Parse schema_markup if provided ── */
    let schemaMarkup = null;
    if (body?.schema_markup) {
      try {
        schemaMarkup = typeof body.schema_markup === 'string' 
          ? JSON.parse(body.schema_markup) 
          : body.schema_markup;
      } catch (e) {
        console.error("Invalid schema_markup JSON:", e);
        // Optionally return error or continue with null
      }
    }

    /* ── Searchable snippets ── */
    const searchableSnippets = parseArray(body?.searchableSnippets).length > 0
      ? parseArray(body.searchableSnippets)
      : [title, metaTitle].filter(Boolean);

    /* ── FAQs ── */
    const faqs = parseJSONArray(body?.faqs, []);

    /* ── Auto reading time ── */
    const readingTime = body?.readingTime
      ? parseInt(body.readingTime)
      : calcReadingTime(body.content);

    /* ── Persist to DB ── */
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt: body.excerpt.trim(),
        content: body.content,

        featured_img_url: cloudinaryResult.secure_url,
        featured_img_alt: body?.featured_img_alt?.trim() || null,
        featured_img_caption: body?.featured_img_caption?.trim() || null,
        secure_url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id,

        metaTitle,
        metaDescription: body.metaDescription.trim(),

        is_featured: toBool(body?.is_featured),

        faqs,
        schema_markup: schemaMarkup, // ← ADD THIS

        canonicalUrl: body?.canonicalUrl?.trim() || null,

        noIndex: toBool(body?.noIndex),
        noFollow: toBool(body?.noFollow),

        ogTitle: body?.ogTitle?.trim() || null,
        ogDescription: body?.ogDescription?.trim() || null,

        twitterTitle: body?.twitterTitle?.trim() || null,
        twitterDescription: body?.twitterDescription?.trim() || null,

        searchableSnippets,

        authorName: body.authorName.trim(),
        authorBio: body?.authorBio?.trim() || null,

        status: ["DRAFT", "PUBLISHED"].includes(body?.status?.toUpperCase())
          ? body.status.toUpperCase()
          : "DRAFT",

        readingTime,

        ...(categoryId && { categoryId }),
      },
      include: { category: { select: CATEGORY_CARD_SELECT } },
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully.",
      data: blog,
    });
  } catch (error) {
    console.error("createBlog Error:", error);

    if (error?.code === "P2002") {
      const target = error?.meta?.target;
      return res.status(409).json({
        success: false,
        message: `A blog with this ${Array.isArray(target) ? target.join(", ") : target} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create blog.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   5. PROTECTED — UPDATE BLOG
   PUT /api/blogs/:id
   Body: multipart/form-data — all fields optional except required ones
───────────────────────────────────────────── */
export const updateBlog = async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog ID." });
    }

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Blog not found." });
    }

    const body = req?.body ?? {};
    const updateData = {};

    /* ── Category change ── */
    if (body?.categoryId !== undefined) {
      if (body.categoryId === "" || body.categoryId === null) {
        updateData.categoryId = null;
      } else {
        const categoryId = parseInt(body.categoryId);
        if (isNaN(categoryId)) {
          return res.status(400).json({ success: false, message: "Invalid categoryId." });
        }
        const category = await prisma.blogCategory.findUnique({ where: { id: categoryId } });
        if (!category) {
          return res.status(404).json({ success: false, message: "Category not found." });
        }
        updateData.categoryId = categoryId;
      }
    }

    /* ── Handle new image upload ── */
    if (req?.file) {
      if (existing?.cloudinary_public_id) {
        deleteFromCloudinary(existing.cloudinary_public_id).catch((err) =>
          console.error("Old image deletion failed:", err)
        );
      }

      let cloudinaryResult;
      try {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer, "blogs/featured-images");
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(502).json({
          success: false,
          message: "Image upload failed. Please try again.",
          error: uploadError?.message ?? "Cloudinary error.",
        });
      }

      updateData.featured_img_url = cloudinaryResult.secure_url;
      updateData.secure_url = cloudinaryResult.secure_url;
      updateData.cloudinary_public_id = cloudinaryResult.public_id;
    }

    /* ── Conditionally map body fields ── */
    if (body?.title?.trim()) {
      updateData.title = body.title.trim();
      if (body.title.trim() !== existing.title) {
        updateData.slug = await generateUniqueSlug(body.title, id);
      }
    }
    if (body?.excerpt?.trim()) updateData.excerpt = body.excerpt.trim();
    if (body?.content) updateData.content = body.content;
    if (body?.featured_img_alt !== undefined) updateData.featured_img_alt = body.featured_img_alt?.trim() || null;
    if (body?.featured_img_caption !== undefined) updateData.featured_img_caption = body.featured_img_caption?.trim() || null;
    if (body?.metaTitle?.trim()) updateData.metaTitle = body.metaTitle.trim();
    if (body?.metaDescription?.trim()) updateData.metaDescription = body.metaDescription.trim();
    if (body?.is_featured !== undefined) updateData.is_featured = toBool(body.is_featured);
    if (body?.faqs !== undefined) updateData.faqs = parseJSONArray(body.faqs, []);
    
    /* ── Handle schema_markup ── */
    if (body?.schema_markup !== undefined) {
      try {
        updateData.schema_markup = typeof body.schema_markup === 'string' 
          ? JSON.parse(body.schema_markup) 
          : body.schema_markup;
      } catch (e) {
        console.error("Invalid schema_markup JSON:", e);
        // Keep existing value or set to null
        updateData.schema_markup = null;
      }
    }
    
    if (body?.canonicalUrl !== undefined) updateData.canonicalUrl = body.canonicalUrl?.trim() || null;
    if (body?.noIndex !== undefined) updateData.noIndex = toBool(body.noIndex);
    if (body?.noFollow !== undefined) updateData.noFollow = toBool(body.noFollow);
    if (body?.ogTitle !== undefined) updateData.ogTitle = body.ogTitle?.trim() || null;
    if (body?.ogDescription !== undefined) updateData.ogDescription = body.ogDescription?.trim() || null;
    if (body?.twitterTitle !== undefined) updateData.twitterTitle = body.twitterTitle?.trim() || null;
    if (body?.twitterDescription !== undefined) updateData.twitterDescription = body.twitterDescription?.trim() || null;
    if (body?.authorName?.trim()) updateData.authorName = body.authorName.trim();
    if (body?.authorBio !== undefined) updateData.authorBio = body.authorBio?.trim() || null;

    /* ── Status ── */
    if (body?.status) {
      const s = body.status.toUpperCase();
      if (["DRAFT", "PUBLISHED"].includes(s)) updateData.status = s;
    }

    /* ── Searchable snippets ── */
    if (body?.searchableSnippets !== undefined) {
      updateData.searchableSnippets = parseArray(body.searchableSnippets);
    } else if (updateData.title || updateData.metaTitle) {
      const t = updateData?.title ?? existing.title;
      const mt = updateData?.metaTitle ?? existing.metaTitle;
      updateData.searchableSnippets = [t, mt].filter(Boolean);
    }

    /* ── Reading time ── */
    if (body?.readingTime) {
      updateData.readingTime = parseInt(body.readingTime);
    } else if (updateData.content) {
      updateData.readingTime = calcReadingTime(updateData.content);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: updateData,
      include: { category: { select: CATEGORY_CARD_SELECT } },
    });

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully.",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("updateBlog Error:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug or image already exists.",
      });
    }

    if (error?.code === "P2025") {
      return res.status(404).json({ success: false, message: "Blog not found." });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update blog.",
      error: error?.message ?? "Internal server error.",
    });
  }
};
/* ─────────────────────────────────────────────
   6. PROTECTED — DELETE BLOG
   DELETE /api/blogs/:id
   Also deletes the Cloudinary featured image (public_id is stored directly)
───────────────────────────────────────────── */
export const deleteBlog = async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid blog ID." });
    }

    /* ── Fetch existing blog to get the Cloudinary public_id ── */
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Blog not found." });
    }

    /* ── Delete from DB first ── */
    await prisma.blog.delete({ where: { id } });

    /* ── Delete image from Cloudinary (non-blocking, errors logged) ── */
    if (existing?.cloudinary_public_id) {
      deleteFromCloudinary(existing.cloudinary_public_id).catch((err) =>
        console.error("Cloudinary image deletion failed:", err)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully.",
      data: { id, slug: existing.slug, title: existing.title },
    });
  } catch (error) {
    console.error("deleteBlog Error:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ success: false, message: "Blog not found." });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete blog.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   PUBLIC — SITEMAP
   GET /api/blogs/sitemap
───────────────────────────────────────────── */
export const getBlogsForSitemap = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error("getBlogsForSitemap Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sitemap blogs.",
    });
  }
};

