import slugify from "slugify";
import { prisma } from "../config/db.js";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from "../config/cloudinary.js";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const generateUniqueSlug = async (name, excludeId = null) => {
  const base = slugify(name, { lower: true, strict: true, trim: true });

  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.blogCategory.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter++}`;
  }

  return slug;
};

const toBool = (value) => value === true || value === "true";

/* ─────────────────────────────────────────────
   1. PUBLIC — PAGINATED CATEGORY LISTING
   GET /api/blogs/categories
   Query: ?page=1&limit=20&search=keyword&featured=true
───────────────────────────────────────────── */
export const getCategoriesPaginated = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req?.query?.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req?.query?.limit) || 20));
    const skip = (page - 1) * limit;

    const search = req?.query?.search?.trim() || null;
    const featuredOnly = req?.query?.featured === "true";

    const where = {
      ...(featuredOnly && { isFeatured: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [categories, total] = await Promise.all([
      prisma.blogCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          color: true,
          isFeatured: true,
          metaTitle: true,
          metaDescription: true,
          // NOTE: counts ALL blogs (draft + published). If you need a
          // published-only count, use a filtered relation count instead:
          // _count: { select: { blogs: { where: { status: "PUBLISHED" } } } }
          _count: { select: { blogs: true } },
        },
      }),
      prisma.blogCategory.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: total === 0 ? "No categories found." : "Categories fetched successfully.",
      data: {
        categories,
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
    console.error("getCategoriesPaginated Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   2. PUBLIC — SINGLE CATEGORY BY SLUG
   GET /api/blogs/categories/:slug
───────────────────────────────────────────── */
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req?.params ?? {};

    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required." });
    }

    const category = await prisma.blogCategory.findUnique({
      where: { slug },
      include: { _count: { select: { blogs: true } } },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully.",
      data: category,
    });
  } catch (error) {
    console.error("getCategoryBySlug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   3. PROTECTED — ALL CATEGORIES FOR DASHBOARD
   GET /api/blogs/categories/admin/all
   Query: ?page=1&limit=20&search=keyword
───────────────────────────────────────────── */
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req?.query?.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req?.query?.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req?.query?.search?.trim() || null;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [categories, total] = await Promise.all([
      prisma.blogCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { blogs: true } } },
      }),
      prisma.blogCategory.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "All categories fetched successfully.",
      data: {
        categories,
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
    console.error("getAllCategoriesAdmin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   4. PROTECTED — CREATE CATEGORY
   POST /api/blogs/categories
   Body: multipart/form-data (image file optional + JSON fields)
───────────────────────────────────────────── */
export const createCategory = async (req, res) => {
  try {
    const body = req?.body ?? {};

    if (!body?.name?.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    /* ── Image is optional for categories ── */
    let cloudinaryResult = null;
    if (req?.file) {
      try {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer, "blogs/category-images");
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(502).json({
          success: false,
          message: "Image upload failed. Please try again.",
          error: uploadError?.message ?? "Cloudinary error.",
        });
      }
    }

    const name = body.name.trim();
    const slug = await generateUniqueSlug(name);

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description: body?.description?.trim() || null,

        metaTitle: body?.metaTitle?.trim() || null,
        metaDescription: body?.metaDescription?.trim() || null,
        canonicalUrl: body?.canonicalUrl?.trim() || null,

        ogTitle: body?.ogTitle?.trim() || null,
        ogDescription: body?.ogDescription?.trim() || null,
        twitterTitle: body?.twitterTitle?.trim() || null,
        twitterDescription: body?.twitterDescription?.trim() || null,

        noIndex: toBool(body?.noIndex),
        noFollow: toBool(body?.noFollow),

        imageUrl: cloudinaryResult?.secure_url || null,
        cloudinary_public_id: cloudinaryResult?.public_id || null,
        color: body?.color?.trim() || null,

        isFeatured: toBool(body?.isFeatured),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    console.error("createCategory Error:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A category with this name/slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   5. PROTECTED — UPDATE CATEGORY
   PUT /api/blogs/categories/:id
   Body: multipart/form-data — all fields optional
───────────────────────────────────────────── */
export const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const body = req?.body ?? {};
    const updateData = {};

    /* ── Handle new image upload if provided ── */
    if (req?.file) {
      // Fall back to URL-parsing for any pre-existing rows that don't have
      // cloudinary_public_id stored yet.
      const oldPublicId = existing?.cloudinary_public_id || extractPublicId(existing?.imageUrl);
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
          console.error("Old image deletion failed:", err)
        );
      }

      let cloudinaryResult;
      try {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer, "blogs/category-images");
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(502).json({
          success: false,
          message: "Image upload failed. Please try again.",
          error: uploadError?.message ?? "Cloudinary error.",
        });
      }

      updateData.imageUrl = cloudinaryResult.secure_url;
      updateData.cloudinary_public_id = cloudinaryResult.public_id;
    }

    if (body?.name?.trim()) {
      updateData.name = body.name.trim();
      if (body.name.trim() !== existing.name) {
        updateData.slug = await generateUniqueSlug(body.name, id);
      }
    }
    if (body?.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body?.metaTitle !== undefined) updateData.metaTitle = body.metaTitle?.trim() || null;
    if (body?.metaDescription !== undefined) updateData.metaDescription = body.metaDescription?.trim() || null;
    if (body?.canonicalUrl !== undefined) updateData.canonicalUrl = body.canonicalUrl?.trim() || null;
    if (body?.ogTitle !== undefined) updateData.ogTitle = body.ogTitle?.trim() || null;
    if (body?.ogDescription !== undefined) updateData.ogDescription = body.ogDescription?.trim() || null;
    if (body?.twitterTitle !== undefined) updateData.twitterTitle = body.twitterTitle?.trim() || null;
    if (body?.twitterDescription !== undefined) updateData.twitterDescription = body.twitterDescription?.trim() || null;
    if (body?.noIndex !== undefined) updateData.noIndex = toBool(body.noIndex);
    if (body?.noFollow !== undefined) updateData.noFollow = toBool(body.noFollow);
    if (body?.color !== undefined) updateData.color = body.color?.trim() || null;
    if (body?.isFeatured !== undefined) updateData.isFeatured = toBool(body.isFeatured);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const updatedCategory = await prisma.blogCategory.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("updateCategory Error:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A category with this name/slug already exists.",
      });
    }

    if (error?.code === "P2025") {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category.",
      error: error?.message ?? "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   6. PROTECTED — DELETE CATEGORY
   DELETE /api/blogs/categories/:id?force=true
   Blocks delete if blogs are still attached, unless force=true
   (onDelete: SetNull means attached blogs just become uncategorized)
───────────────────────────────────────────── */
export const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    const existing = await prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { blogs: true } } },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const force = req?.query?.force === "true";
    if (existing._count.blogs > 0 && !force) {
      return res.status(409).json({
        success: false,
        message: `This category has ${existing._count.blogs} blog(s) attached. Pass ?force=true to delete anyway — those blogs will become uncategorized.`,
      });
    }

    await prisma.blogCategory.delete({ where: { id } });

    const publicId = existing?.cloudinary_public_id || extractPublicId(existing?.imageUrl);
    if (publicId) {
      deleteFromCloudinary(publicId).catch((err) =>
        console.error("Cloudinary image deletion failed:", err)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
      data: { id, slug: existing.slug, name: existing.name },
    });
  } catch (error) {
    console.error("deleteCategory Error:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete category.",
      error: error?.message ?? "Internal server error.",
    });
  }
};