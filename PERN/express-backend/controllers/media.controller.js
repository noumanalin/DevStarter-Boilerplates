import { prisma } from "../config/db.js";
import cloudinary, {
  uploadToCloudinary,
  deleteFromCloudinary,
  getResourceType,
  getUploadFormat,
} from "../config/cloudinary.js";

/* -----------------------------
CREATE MEDIA
POST /api/media
------------------------------ */
export const createMedia = async (req, res) => {
  try {
    const file = req.file;
    const { alt_text, caption } = req.body ?? {};

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resourceType = getResourceType(file.mimetype);
    const format = getUploadFormat(file.mimetype, file.originalname);

    const result = await uploadToCloudinary(
      file.buffer,
      "media",
      undefined,
      resourceType,
      format
    );

    const media = await prisma.media.create({
      data: {
        url: result.secure_url,
        secure_url: result.secure_url,
        cloudinary_public_id: result.public_id,
        type: mapMimeToType(file.mimetype),
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        alt_text: alt_text || null,
        caption: caption || null,
        width: result.width || null,
        height: result.height || null,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error("Create media error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------
GET ALL MEDIA
GET /api/media
------------------------------ */
export const getAllMedia = async (req, res) => {
  try {
    const media = await prisma.media.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(media);
  } catch (error) {
    console.error("Get all media error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------
GET SINGLE MEDIA
GET /api/media/:id
------------------------------ */
export const getSingleMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id: Number(id) },
    });

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.json(media);
  } catch (error) {
    console.error("Get single media error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------
UPDATE MEDIA
PUT /api/media/:id
------------------------------ */
export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, caption, original_name } = req.body ?? {};

    const existingMedia = await prisma.media.findUnique({
      where: { id: Number(id) },
    });

    if (!existingMedia) {
      return res.status(404).json({ message: "Media not found" });
    }

    const trimmedName = original_name?.trim();

    const updatedMedia = await prisma.media.update({
      where: { id: Number(id) },
      data: {
        alt_text:
          alt_text !== undefined ? alt_text?.trim() || null : existingMedia.alt_text,
        caption:
          caption !== undefined ? caption?.trim() || null : existingMedia.caption,
        original_name:
          trimmedName !== undefined && trimmedName !== ""
            ? trimmedName
            : existingMedia.original_name,
      },
    });

    res.json(updatedMedia);
  } catch (error) {
    console.error("Update media error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------
DELETE MEDIA
DELETE /api/media/:id
------------------------------ */
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id: Number(id) },
    });

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    if (media.cloudinary_public_id) {
      // Must match the resource_type the asset was originally uploaded
      // with, or Cloudinary won't find/delete it (see cloudinary.js notes).
      const resourceType = getResourceType(media.mime_type || "");
      await deleteFromCloudinary(media.cloudinary_public_id, resourceType);
    }

    await prisma.media.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------
GET MEDIA STATS / ANALYTICS
GET /api/media/stats
------------------------------ */
export const getMediaStats = async (req, res) => {
  try {
    const TREND_DAYS = 7;

    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const trendStart = new Date(todayUTC);
    trendStart.setUTCDate(trendStart.getUTCDate() - (TREND_DAYS - 1));

    const [totalCount, sizeAgg, typeBreakdown, latestUpload, largestFile, trendItems] =
      await Promise.all([
        prisma.media.count(),
        prisma.media.aggregate({ _sum: { size: true }, _avg: { size: true } }),
        prisma.media.groupBy({
          by: ["type"],
          _count: { _all: true },
          _sum: { size: true },
        }),
        prisma.media.findFirst({
          orderBy: { created_at: "desc" },
          select: { id: true, original_name: true, type: true, created_at: true },
        }),
        prisma.media.findFirst({
          orderBy: { size: "desc" },
          select: { id: true, original_name: true, type: true, size: true },
        }),
        prisma.media.findMany({
          where: { created_at: { gte: trendStart } },
          select: { created_at: true, size: true },
        }),
      ]);

    const countByType = (type) =>
      typeBreakdown.find((t) => t.type === type)?._count?._all ?? 0;
    const sizeByType = (type) =>
      typeBreakdown.find((t) => t.type === type)?._sum?.size ?? 0;

    const breakdown = ["IMAGE", "VIDEO", "PDF", "DOC", "OTHER"].map((type) => ({
      type,
      count: countByType(type),
      size: sizeByType(type),
    }));

    const trend = Array.from({ length: TREND_DAYS }, (_, idx) => {
      const date = new Date(trendStart);
      date.setUTCDate(trendStart.getUTCDate() + idx);
      return {
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
        count: 0,
        size: 0,
      };
    });

    trendItems.forEach((item) => {
      const key = item.created_at.toISOString().slice(0, 10);
      const bucket = trend.find((b) => b.date === key);
      if (bucket) {
        bucket.count += 1;
        bucket.size += item.size ?? 0;
      }
    });

    res.json({
      totals: {
        files: totalCount,
        images: countByType("IMAGE"),
        videos: countByType("VIDEO"),
        documents: countByType("PDF") + countByType("DOC"),
        others: countByType("OTHER"),
        totalSize: sizeAgg._sum.size ?? 0,
        avgSize: Math.round(sizeAgg._avg.size ?? 0),
      },
      breakdown,
      trend,
      latestUpload: latestUpload ?? null,
      largestFile: largestFile ?? null,
    });
  } catch (error) {
    console.error("Get media stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------
GET CLOUDINARY USAGE
GET /api/media/cloudinary-usage
------------------------------ */
export const getCloudinaryUsage = async (req, res) => {
  try {
    const usage = await cloudinary.api.usage();
    res.json({
      plan: usage?.plan,
      creditsUsed: usage?.credits?.usage ?? 0,
      creditsLimit: usage?.credits?.limit ?? 0,
      bandwidthBytes: usage?.bandwidth?.usage ?? 0,
      storageBytes: usage?.storage?.usage ?? 0,
      transformations: usage?.transformations?.usage ?? 0,
    });
  } catch (error) {
    console.error("Cloudinary usage error:", error);
    res.status(500).json({ message: "Unable to fetch Cloudinary usage" });
  }
};

/* -----------------------------
HELPER: MIME TYPE → your own Media.type enum (IMAGE/VIDEO/PDF/DOC/OTHER)
This is independent of Cloudinary's resource_type — it's purely for your
own UI categorization (badges, filters, FileModal rendering), so it's
unaffected by the resource_type fix above.
------------------------------ */
const mapMimeToType = (mime) => {
  if (mime.startsWith("image")) return "IMAGE";
  if (mime.startsWith("video")) return "VIDEO";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("word") || mime.includes("document")) return "DOC";
  if (mime.includes("sheet") || mime.includes("excel")) return "DOC";
  return "OTHER";
};